<?php

namespace App\Services;

use App\Models\ChartOfAccount;
use App\Models\JournalLine;
use App\Services\TenantContext;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportService
{
    /**
     * Generate Profit & Loss Report
     * 
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return array
     */
    public function profitAndLoss(Carbon $startDate, Carbon $endDate): array
    {
        $tenant = TenantContext::getTenant();
        
        // Get all income and expense accounts
        $incomeAccounts = ChartOfAccount::where('type', 'income')->get();
        $expenseAccounts = ChartOfAccount::where('type', 'expense')->get();
        
        $income = [];
        $totalIncome = 0;
        
        foreach ($incomeAccounts as $account) {
            $balance = $this->getAccountBalance($account, $startDate, $endDate);
            if ($balance != 0) {
                $income[] = [
                    'account_code' => $account->code,
                    'account_name' => $account->name,
                    'amount' => abs($balance), // Income is credit, show as positive
                ];
                $totalIncome += abs($balance);
            }
        }
        
        $expenses = [];
        $totalExpenses = 0;
        
        foreach ($expenseAccounts as $account) {
            $balance = $this->getAccountBalance($account, $startDate, $endDate);
            if ($balance != 0) {
                $expenses[] = [
                    'account_code' => $account->code,
                    'account_name' => $account->name,
                    'amount' => abs($balance), // Expense is debit, show as positive
                ];
                $totalExpenses += abs($balance);
            }
        }
        
        $netProfit = $totalIncome - $totalExpenses;
        
        return [
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
            'income' => [
                'accounts' => $income,
                'total' => $totalIncome,
            ],
            'expenses' => [
                'accounts' => $expenses,
                'total' => $totalExpenses,
            ],
            'net_profit' => $netProfit,
        ];
    }

    /**
     * Generate Balance Sheet
     * 
     * @param Carbon $asOfDate
     * @return array
     */
    public function balanceSheet(Carbon $asOfDate): array
    {
        $tenant = TenantContext::getTenant();
        
        // Assets
        $assetAccounts = ChartOfAccount::where('type', 'asset')->get();
        $assets = [];
        $totalAssets = 0;
        
        foreach ($assetAccounts as $account) {
            $balance = $this->getAccountBalance($account, null, $asOfDate);
            if ($balance != 0) {
                $assets[] = [
                    'account_code' => $account->code,
                    'account_name' => $account->name,
                    'amount' => abs($balance), // Assets are debit, show as positive
                ];
                $totalAssets += abs($balance);
            }
        }
        
        // Liabilities
        $liabilityAccounts = ChartOfAccount::where('type', 'liability')->get();
        $liabilities = [];
        $totalLiabilities = 0;
        
        foreach ($liabilityAccounts as $account) {
            $balance = $this->getAccountBalance($account, null, $asOfDate);
            if ($balance != 0) {
                $liabilities[] = [
                    'account_code' => $account->code,
                    'account_name' => $account->name,
                    'amount' => abs($balance), // Liabilities are credit, show as positive
                ];
                $totalLiabilities += abs($balance);
            }
        }
        
        // Equity
        $equityAccounts = ChartOfAccount::where('type', 'equity')->get();
        $equity = [];
        $totalEquity = 0;
        
        foreach ($equityAccounts as $account) {
            $balance = $this->getAccountBalance($account, null, $asOfDate);
            if ($balance != 0) {
                $equity[] = [
                    'account_code' => $account->code,
                    'account_name' => $account->name,
                    'amount' => abs($balance), // Equity is credit, show as positive
                ];
                $totalEquity += abs($balance);
            }
        }
        
        // Add retained earnings (net profit/loss)
        $retainedEarnings = $this->getRetainedEarnings($asOfDate);
        if ($retainedEarnings != 0) {
            $equity[] = [
                'account_code' => 'RE',
                'account_name' => 'Retained Earnings',
                'amount' => $retainedEarnings,
            ];
            $totalEquity += $retainedEarnings;
        }
        
        return [
            'as_of_date' => $asOfDate->format('Y-m-d'),
            'assets' => [
                'accounts' => $assets,
                'total' => $totalAssets,
            ],
            'liabilities' => [
                'accounts' => $liabilities,
                'total' => $totalLiabilities,
            ],
            'equity' => [
                'accounts' => $equity,
                'total' => $totalEquity,
            ],
            'total_liabilities_and_equity' => $totalLiabilities + $totalEquity,
        ];
    }

    /**
     * Generate Trial Balance
     * 
     * @param Carbon $asOfDate
     * @return array
     */
    public function trialBalance(Carbon $asOfDate): array
    {
        $tenant = TenantContext::getTenant();
        
        $accounts = ChartOfAccount::orderBy('code')->get();
        $balances = [];
        $totalDebit = 0;
        $totalCredit = 0;
        
        foreach ($accounts as $account) {
            $balance = $this->getAccountBalance($account, null, $asOfDate);
            
            if ($balance != 0) {
                $debit = $balance > 0 ? $balance : 0;
                $credit = $balance < 0 ? abs($balance) : 0;
                
                $balances[] = [
                    'account_code' => $account->code,
                    'account_name' => $account->name,
                    'account_type' => $account->type,
                    'debit' => $debit,
                    'credit' => $credit,
                ];
                // Keep total calc same if balance > 0 is debit
                $totalDebit += $debit;
                $totalCredit += $credit;
            }
        }
        
        return [
            'as_of_date' => $asOfDate->format('Y-m-d'),
            'accounts' => $balances,
            'total_debit' => $totalDebit,
            'total_credit' => $totalCredit,
            'balanced' => abs($totalDebit - $totalCredit) < 0.01,
        ];
    }

    /**
     * Get account balance for a period
     * 
     * @param ChartOfAccount $account
     * @param Carbon|null $startDate
     * @param Carbon $endDate
     * @return float Positive for debit balance, negative for credit balance
     */
    protected function getAccountBalance(ChartOfAccount $account, ?Carbon $startDate, Carbon $endDate): float
    {
        $query = JournalLine::where('account_id', $account->id)
            ->whereHas('journalEntry', function ($q) use ($startDate, $endDate) {
                $q->where('status', 'posted')
                  ->where('date', '<=', $endDate);
                
                if ($startDate) {
                    $q->where('date', '>=', $startDate);
                }
            });
        
        $balance = $query->sum(DB::raw("CASE 
            WHEN type = 'debit' THEN amount 
            WHEN type = 'credit' THEN -amount 
            ELSE 0 END"));
            
        return $balance;
    }

    /**
     * Get retained earnings (accumulated profit/loss)
     * 
     * @param Carbon $asOfDate
     * @return float
     */
    protected function getRetainedEarnings(Carbon $asOfDate): float
    {
        $tenant = TenantContext::getTenant();
        
        // Get all income and expense transactions up to the date
        $incomeAccounts = ChartOfAccount::where('type', 'income')->pluck('id');
        $expenseAccounts = ChartOfAccount::where('type', 'expense')->pluck('id');
        
        $totalIncome = JournalLine::whereIn('account_id', $incomeAccounts)
            ->whereHas('journalEntry', function ($q) use ($asOfDate) {
                $q->where('status', 'posted')->where('date', '<=', $asOfDate);
            })
            ->sum(DB::raw("CASE WHEN type = 'credit' THEN amount ELSE -amount END"));
        
        $totalExpenses = JournalLine::whereIn('account_id', $expenseAccounts)
            ->whereHas('journalEntry', function ($q) use ($asOfDate) {
                $q->where('status', 'posted')->where('date', '<=', $asOfDate);
            })
            ->sum(DB::raw("CASE WHEN type = 'debit' THEN amount ELSE -amount END"));
        
        return $totalIncome - $totalExpenses;
    }

    /**
     * Get AR Aging Report
     * 
     * @return array
     */
    public function arAging(): array
    {
        $invoices = \App\Models\Invoice::where('status', '!=', 'void')
            ->where('outstanding_amount', '>', 0)
            ->with('customer')
            ->get();
        
        $aging = [
            'current' => [],
            '1_30' => [],
            '31_60' => [],
            '61_90' => [],
            'over_90' => [],
        ];
        
        $totals = [
            'current' => 0,
            '1_30' => 0,
            '31_60' => 0,
            '61_90' => 0,
            'over_90' => 0,
        ];
        
        foreach ($invoices as $invoice) {
            $daysOverdue = now()->diffInDays($invoice->due_date, false);
            $category = $this->getAgingCategory($daysOverdue);
            
            $aging[$category][] = [
                'invoice_number' => $invoice->number, // assuming number column based on prev context
                'customer' => $invoice->customer->name,
                'date' => $invoice->date->format('Y-m-d'),
                'due_date' => $invoice->due_date->format('Y-m-d'),
                'amount' => $invoice->outstanding_amount,
                'days_overdue' => max(0, -$daysOverdue),
            ];
            
            $totals[$category] += $invoice->outstanding_amount;
        }
        
        return [
            'aging' => $aging,
            'totals' => $totals,
            'grand_total' => array_sum($totals),
        ];
    }

    /**
     * Determine aging category
     * 
     * @param int $daysOverdue
     * @return string
     */
    protected function getAgingCategory(int $daysOverdue): string
    {
        if ($daysOverdue >= 0) {
            return 'current';
        } elseif ($daysOverdue >= -30) {
            return '1_30';
        } elseif ($daysOverdue >= -60) {
            return '31_60';
        } elseif ($daysOverdue >= -90) {
            return '61_90';
        } else {
            return 'over_90';
        }
    }

    /**
     * Get AP Aging Report
     * 
     * @return array
     */
    public function apAging(): array
    {
        $invoices = \App\Models\PurchaseInvoice::where('status', '!=', 'void')
            ->where('outstanding_amount', '>', 0)
            ->with('supplier')
            ->get();
        
        $aging = [
            'current' => [],
            '1_30' => [],
            '31_60' => [],
            '61_90' => [],
            'over_90' => [],
        ];
        
        $totals = [
            'current' => 0,
            '1_30' => 0,
            '31_60' => 0,
            '61_90' => 0,
            'over_90' => 0,
        ];
        
        foreach ($invoices as $invoice) {
            $daysOverdue = now()->diffInDays($invoice->due_date, false);
            $category = $this->getAgingCategory($daysOverdue);
            
            $aging[$category][] = [
                'invoice_number' => $invoice->number,
                'supplier' => $invoice->supplier->name,
                'date' => $invoice->date->format('Y-m-d'),
                'due_date' => $invoice->due_date->format('Y-m-d'),
                'amount' => $invoice->outstanding_amount,
                'days_overdue' => max(0, -$daysOverdue),
            ];
            
            $totals[$category] += $invoice->outstanding_amount;
        }
        
        return [
            'aging' => $aging,
            'totals' => $totals,
            'grand_total' => array_sum($totals),
        ];
    }

    /**
     * Get Inventory Valuation Report
     * 
     * @return array
     */
    public function inventoryValuation(): array
    {
        $inventoryService = app(\App\Services\InventoryService::class);
        $valuation = $inventoryService->getTotalValuation();
        
        return $valuation;
    }
}
