<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\ChartOfAccount;
use App\Models\JournalLine;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class CashbookController extends Controller
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

        // Get Cash/Bank Accounts
        // 1. Linked to BankAccount model
        $bankAccountIds = BankAccount::pluck('account_id')->toArray();
        // 2. Or name contains "Cash" (heuristic for Petty Cash if not set as Bank)
        $cashAccountIds = ChartOfAccount::where('name', 'like', '%Cash%')->pluck('id')->toArray();

        $allowedAccountIds = array_unique(array_merge($bankAccountIds, $cashAccountIds));

        $accounts = ChartOfAccount::whereIn('id', $allowedAccountIds)
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        // Default to first account if none selected and list is not empty
        if (!$accountId && count($accounts) > 0) {
            $accountId = $accounts[0]->id;
        }

        $ledger = null;

        if ($accountId) {
            $account = ChartOfAccount::find($accountId);

            // Calculate Opening Balance
            // Asset (Cash/Bank): Debit - Credit

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
                ->join('journal_entries', 'journal_lines.journal_entry_id', '=', 'journal_entries.id')
                ->orderBy('journal_entries.date')
                ->orderBy('journal_entries.number')
                ->select('journal_lines.*')
                ->get();

            $ledger = [
                'account' => $account,
                'opening_balance' => $openingBalance,
                'lines' => $lines,
            ];
        }

        return Inertia::render('Accounting/Cashbook/Index', [
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
