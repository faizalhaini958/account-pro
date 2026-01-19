<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\JournalLine;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class GeneralLedgerController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('accounting.view');

        $filters = $request->validate([
            'account_id' => 'nullable|exists:chart_of_accounts,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $startDate = $filters['start_date'] ?? Carbon::now()->startOfMonth()->toDateString();
        $endDate = $filters['end_date'] ?? Carbon::now()->endOfMonth()->toDateString();
        $accountId = $filters['account_id'] ?? null;

        $accounts = ChartOfAccount::orderBy('code')->get(['id', 'code', 'name']);

        $ledger = null;
        $openingBalance = 0;

        if ($accountId) {
            $account = ChartOfAccount::find($accountId);

            // Calculate Opening Balance (Sum of all lines before start date)
            // Balance Type: Asset/Expense = Debit - Credit. Liability/Equity/Income = Credit - Debit.
            // For raw GL, we usually assume Debit Positive.

            // Actually, let's just do Debit - Credit for the raw calc, and let frontend handle display logic based on account type if needed.
            // Normalized: Balance = Sum(Debit) - Sum(Credit) (Treating as normal Asset math)

            $openingDebit = JournalLine::where('account_id', $accountId)
                ->whereHas('journalEntry', function($q) use ($startDate) {
                    $q->where('date', '<', $startDate)
                      ->where('status', '!=', 'void');
                })
                ->where('type', 'debit')
                ->sum('amount');

            $openingCredit = JournalLine::where('account_id', $accountId)
                ->whereHas('journalEntry', function($q) use ($startDate) {
                    $q->where('date', '<', $startDate)
                      ->where('status', '!=', 'void');
                })
                ->where('type', 'credit')
                ->sum('amount');

            $openingBalance = $openingDebit - $openingCredit;

            // Fetch Transactions
            $lines = JournalLine::with('journalEntry')
                ->where('account_id', $accountId)
                ->whereHas('journalEntry', function($q) use ($startDate, $endDate) {
                    $q->whereBetween('date', [$startDate, $endDate])
                      ->where('status', '!=', 'void');
                })
                // Order by Journal Date, then Created At
                ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
                ->orderBy('journal_entries.date')
                ->orderBy('journal_entries.number')
                ->select('journal_lines.*') // Avoid column collision
                ->get();

            $ledger = [
                'account' => $account,
                'opening_balance' => $openingBalance,
                'lines' => $lines,
            ];
        }

        return Inertia::render('Accounting/GeneralLedger/Index', [
            'accounts' => $accounts,
            'filters' => [
                'account_id' => $accountId,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'ledger' => $ledger,
        ]);
    }
}
