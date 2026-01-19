<?php

namespace App\Exports;

use App\Models\ChartOfAccount;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TrialBalanceExport extends BaseExport
{
    protected string $title = 'Trial Balance';
    protected ?string $asOfDate = null;

    public function __construct(
        array $dateRange = [],
        ?string $tenantName = null,
        ?string $asOfDate = null
    ) {
        parent::__construct($dateRange, $tenantName);
        $this->asOfDate = $asOfDate ?? now()->toDateString();
    }

    public function headings(): array
    {
        return [
            'Account Code',
            'Account Name',
            'Type',
            'Debit',
            'Credit',
        ];
    }

    public function collection(): Collection
    {
        $accounts = ChartOfAccount::with(['journalLines' => function ($query) {
            if ($this->asOfDate) {
                $query->whereHas('journalEntry', function ($q) {
                    $q->where('date', '<=', $this->asOfDate)
                      ->where('status', 'posted');
                });
            }
        }])
        ->orderBy('code')
        ->get();

        $data = collect();
        $totalDebit = 0;
        $totalCredit = 0;

        foreach ($accounts as $account) {
            $debit = $account->journalLines->sum('debit');
            $credit = $account->journalLines->sum('credit');

            // Skip accounts with no activity
            if ($debit == 0 && $credit == 0) {
                continue;
            }

            // Calculate balance based on account type
            $balance = $debit - $credit;

            // Normal balance adjustment
            $isDebitNormal = in_array($account->type, ['asset', 'expense']);

            if ($balance >= 0) {
                $debitBalance = $isDebitNormal ? abs($balance) : 0;
                $creditBalance = $isDebitNormal ? 0 : abs($balance);
            } else {
                $debitBalance = $isDebitNormal ? 0 : abs($balance);
                $creditBalance = $isDebitNormal ? abs($balance) : 0;
            }

            $totalDebit += $debitBalance;
            $totalCredit += $creditBalance;

            $data->push([
                $account->code,
                $account->name,
                ucfirst($account->type),
                $this->formatCurrency($debitBalance),
                $this->formatCurrency($creditBalance),
            ]);
        }

        // Add totals row
        $data->push([
            '',
            'TOTAL',
            '',
            $this->formatCurrency($totalDebit),
            $this->formatCurrency($totalCredit),
        ]);

        return $data;
    }
}
