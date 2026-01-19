<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\ChartOfAccount;
use App\Services\BankReconciliationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class BankAccountController extends Controller
{
    protected BankReconciliationService $reconciliationService;

    public function __construct(BankReconciliationService $reconciliationService)
    {
        $this->reconciliationService = $reconciliationService;
    }

    public function index()
    {
        $this->authorize('accounting.view');

        $bankAccounts = BankAccount::with('chartOfAccount')->get()->map(function ($account) {
            $balance = $this->reconciliationService->getBalance($account);
            return [
                'id' => $account->id,
                'name' => $account->name,
                'account_number' => $account->account_number,
                'bank_name' => $account->bank_name,
                'chart_of_account' => $account->chartOfAccount,
                'balance' => $balance,
                'is_active' => $account->is_active,
            ];
        });

        $chartOfAccounts = ChartOfAccount::where('type', 'asset')
            ->where('code', 'like', '11%') // Bank accounts typically start with 11
            ->orderBy('code')
            ->get();

        return Inertia::render('Accounting/BankAccounts/Index', [
            'bankAccounts' => $bankAccounts,
            'chartOfAccounts' => $chartOfAccounts,
        ]);
    }

    public function create()
    {
        $this->authorize('accounting.create');

        $chartOfAccounts = ChartOfAccount::where('type', 'asset')
            ->where('code', 'like', '11%') // Bank accounts typically start with 11
            ->orderBy('code')
            ->get();

        return Inertia::render('Accounting/BankAccounts/Create', [
            'chartOfAccounts' => $chartOfAccounts,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('accounting.create');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'account_number' => 'required|string|max:50',
            'bank_name' => 'required|string|max:255',
            'chart_of_account_id' => 'required|exists:chart_of_accounts,id',
            'is_active' => 'boolean',
        ]);

        BankAccount::create([
            'name' => $validated['name'],
            'bank_name' => $validated['bank_name'],
            'account_number' => $validated['account_number'],
            'account_id' => $validated['chart_of_account_id'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('accounting.bank-accounts.index')
            ->with('success', 'Bank account created successfully.');
    }

    public function edit(BankAccount $bankAccount)
    {
        $this->authorize('accounting.edit');

        $chartOfAccounts = ChartOfAccount::where('type', 'asset')
            ->where('code', 'like', '11%')
            ->orderBy('code')
            ->get();

        return Inertia::render('Accounting/BankAccounts/Edit', [
            'bankAccount' => $bankAccount->load('chartOfAccount'),
            'chartOfAccounts' => $chartOfAccounts,
        ]);
    }

    public function update(Request $request, BankAccount $bankAccount)
    {
        $this->authorize('accounting.edit');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'account_number' => 'required|string|max:50',
            'bank_name' => 'required|string|max:255',
            'chart_of_account_id' => 'required|exists:chart_of_accounts,id',
            'is_active' => 'boolean',
        ]);

        $bankAccount->update([
            'name' => $validated['name'],
            'bank_name' => $validated['bank_name'],
            'account_number' => $validated['account_number'],
            'account_id' => $validated['chart_of_account_id'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('accounting.bank-accounts.index')
            ->with('success', 'Bank account updated successfully.');
    }

    public function destroy(BankAccount $bankAccount)
    {
        // Check if bank account has transactions
        // TODO: Add validation

        $bankAccount->delete();

        return redirect()->route('accounting.bank-accounts.index')
            ->with('success', 'Bank account deleted successfully.');
    }

    /**
     * Show bank reconciliation page
     */
    public function reconciliation(BankAccount $bankAccount, Request $request)
    {
        $upToDate = $request->input('up_to_date')
            ? Carbon::parse($request->input('up_to_date'))
            : now();

        $data = $this->reconciliationService->getUnreconciledTransactions($bankAccount, $upToDate);

        return Inertia::render('Accounting/BankAccounts/Reconciliation', [
            'bankAccount' => $bankAccount->load('chartOfAccount'),
            'transactions' => $data['transactions'],
            'bookBalance' => $data['book_balance'],
            'upToDate' => $upToDate->format('Y-m-d'),
        ]);
    }

    /**
     * Show bank statement
     */
    public function statement(BankAccount $bankAccount, Request $request)
    {
        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))
            : now()->startOfMonth();

        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))
            : now()->endOfMonth();

        $summary = $this->reconciliationService->getStatementSummary($bankAccount, $startDate, $endDate);

        return Inertia::render('Accounting/BankAccounts/Statement', [
            'bankAccount' => $bankAccount->load('chartOfAccount'),
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }
}
