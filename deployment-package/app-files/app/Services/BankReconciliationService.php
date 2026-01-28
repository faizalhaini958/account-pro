<?php

namespace App\Services;

use App\Models\BankAccount;
use App\Models\JournalEntry;
use App\Models\JournalLine;
use App\Services\TenantContext;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class BankReconciliationService
{
    /**
     * Get unreconciled transactions for a bank account
     * 
     * @param BankAccount $bankAccount
     * @param Carbon|null $upToDate
     * @return array
     */
    public function getUnreconciledTransactions(BankAccount $bankAccount, ?Carbon $upToDate = null): array
    {
        $upToDate = $upToDate ?? now();
        
        // Get all journal lines for this bank account
        $transactions = JournalLine::where('account_id', $bankAccount->account_id)
            ->whereHas('journalEntry', function ($q) use ($upToDate) {
                $q->where('status', 'posted')
                  ->where('date', '<=', $upToDate);
            })
            ->with('journalEntry')
            ->orderBy('created_at')
            ->get();
        
        $unreconciled = [];
        $balance = 0;
        
        foreach ($transactions as $line) {
            $debit = $line->type === 'debit' ? $line->amount : 0;
            $credit = $line->type === 'credit' ? $line->amount : 0;
            $amount = $debit - $credit;
            $balance += $amount;
            
            $unreconciled[] = [
                'id' => $line->id,
                'date' => $line->journalEntry->date->format('Y-m-d'),
                'reference' => $line->journalEntry->reference,
                'description' => $line->description,
                'debit' => $debit,
                'credit' => $credit,
                'amount' => $amount,
                'balance' => $balance,
                'reconciled' => false, // TODO: Add reconciliation tracking
            ];
        }
        
        return [
            'transactions' => $unreconciled,
            'book_balance' => $balance,
        ];
    }

    /**
     * Calculate bank reconciliation
     * 
     * @param BankAccount $bankAccount
     * @param float $statementBalance
     * @param Carbon $statementDate
     * @param array $reconciledTransactionIds
     * @return array
     */
    public function reconcile(
        BankAccount $bankAccount,
        float $statementBalance,
        Carbon $statementDate,
        array $reconciledTransactionIds
    ): array {
        $allTransactions = $this->getUnreconciledTransactions($bankAccount, $statementDate);
        
        $reconciledAmount = 0;
        $unreconciledAmount = 0;
        
        foreach ($allTransactions['transactions'] as $transaction) {
            if (in_array($transaction['id'], $reconciledTransactionIds)) {
                $reconciledAmount += $transaction['amount'];
            } else {
                $unreconciledAmount += $transaction['amount'];
            }
        }
        
        $bookBalance = $allTransactions['book_balance'];
        $difference = $statementBalance - $bookBalance;
        
        return [
            'statement_date' => $statementDate->format('Y-m-d'),
            'statement_balance' => $statementBalance,
            'book_balance' => $bookBalance,
            'reconciled_amount' => $reconciledAmount,
            'unreconciled_amount' => $unreconciledAmount,
            'difference' => $difference,
            'balanced' => abs($difference) < 0.01,
        ];
    }

    /**
     * Get bank account balance
     * 
     * @param BankAccount $bankAccount
     * @param Carbon|null $asOfDate
     * @return float
     */
    public function getBalance(BankAccount $bankAccount, ?Carbon $asOfDate = null): float
    {
        $asOfDate = $asOfDate ?? now();
        
        $balance = JournalLine::where('account_id', $bankAccount->account_id)
            ->whereHas('journalEntry', function ($q) use ($asOfDate) {
                $q->where('status', 'posted')
                  ->where('date', '<=', $asOfDate);
            })
            ->sum(\DB::raw("CASE WHEN type = 'debit' THEN amount ELSE -amount END"));
        
        return $balance;
    }

    /**
     * Get bank statement summary
     * 
     * @param BankAccount $bankAccount
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return array
     */
    public function getStatementSummary(
        BankAccount $bankAccount,
        Carbon $startDate,
        Carbon $endDate
    ): array {
        $openingBalance = $this->getBalance($bankAccount, $startDate->copy()->subDay());
        
        $transactions = JournalLine::where('account_id', $bankAccount->account_id)
            ->whereHas('journalEntry', function ($q) use ($startDate, $endDate) {
                $q->where('status', 'posted')
                  ->whereBetween('date', [$startDate, $endDate]);
            })
            ->with('journalEntry')
            ->orderBy('created_at')
            ->get();
        
        $totalDeposits = $transactions->where('type', 'debit')->sum('amount');
        $totalWithdrawals = $transactions->where('type', 'credit')->sum('amount');
        $closingBalance = $openingBalance + $totalDeposits - $totalWithdrawals;
        
        return [
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
            'opening_balance' => $openingBalance,
            'total_deposits' => $totalDeposits,
            'total_withdrawals' => $totalWithdrawals,
            'closing_balance' => $closingBalance,
            'transaction_count' => $transactions->count(),
        ];
    }
}
