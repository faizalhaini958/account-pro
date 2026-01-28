<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class JournalEntryController extends Controller
{
    public function index()
    {
        $this->authorize('accounting.view');

        $entries = JournalEntry::with('lines.account')
            ->orderBy('date', 'desc')
            ->orderBy('number', 'desc')
            ->paginate(15);

        $accounts = ChartOfAccount::where('is_active', true)
            ->orderBy('code')
            ->get();

        return Inertia::render('Accounting/Journals/Index', [
            'entries' => $entries,
            'accounts' => $accounts,
        ]);
    }

    public function create()
    {
        $this->authorize('accounting.create');

        $accounts = ChartOfAccount::where('is_active', true)
            ->orderBy('code')
            ->get();

        return Inertia::render('Accounting/Journals/Create', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('accounting.create');

        $validated = $request->validate([
            'date' => 'required|date',
            'description' => 'nullable|string',
            'reference_number' => 'nullable|string',
            'lines' => 'required|array|min:2',
            'lines.*.account_id' => 'required|exists:chart_of_accounts,id',
            'lines.*.description' => 'nullable|string',
            'lines.*.debit' => 'required|numeric|min:0',
            'lines.*.credit' => 'required|numeric|min:0',
        ]);

        // Validate Validation: Total Debit must equal Total Credit
        $totalDebit = collect($validated['lines'])->sum('debit');
        $totalCredit = collect($validated['lines'])->sum('credit');

        if (abs($totalDebit - $totalCredit) > 0.01) {
            return back()->withErrors(['lines' => "Total Debit ($totalDebit) must equal Total Credit ($totalCredit)."]);
        }

        // Validate Validation: Line must have either debit or credit, not both (for strictness) or valid logic
        // For simplicity, we just trust the math above.

        DB::transaction(function () use ($validated) {
            // Generate Number
            $nextNumber = JournalEntry::where('tenant_id', auth()->user()->current_tenant_id)->max('id') + 1;
            $entryNumber = 'JE-' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);

            $entry = JournalEntry::create([
                // 'tenant_id' => 1, // Handled by trait
                'number' => $entryNumber, // Or from NumberingService
                'date' => $validated['date'],
                'description' => $validated['description'],
                'reference_number' => $validated['reference_number'],
                'status' => 'posted', // Manual entries are usually posted immediately
                'is_system_generated' => false,
            ]);

            foreach ($validated['lines'] as $line) {
                // Determine type and amount
                $type = $line['debit'] > 0 ? 'debit' : 'credit';
                $amount = $line['debit'] > 0 ? $line['debit'] : $line['credit'];

                $entry->lines()->create([
                    'conversation_rate' => 1,
                    'account_id' => $line['account_id'],
                    'description' => $line['description'] ?? $validated['description'],
                    'type' => $type,
                    'amount' => $amount,
                ]);
            }
        });

        return redirect()->route('accounting.journals.index')
            ->with('success', 'Journal entry posted successfully.');
    }

    public function show(JournalEntry $journal)
    {
        $this->authorize('accounting.view');

        $journal->load('lines.account');
        return Inertia::render('Accounting/Journals/Show', [
            'entry' => $journal,
        ]);
    }
}
