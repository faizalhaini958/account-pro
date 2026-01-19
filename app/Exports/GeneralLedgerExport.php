<?php

namespace App\Exports;

use App\Models\ChartOfAccount;
use Illuminate\Support\Collection;

class GeneralLedgerExport extends BaseExport
{
    protected string $title = 'General Ledger';
    protected ?int $accountId = null;

    public function __construct(
        array $dateRange = [],
        ?string $tenantName = null,
        ?int $accountId = null
    ) {
        parent::__construct($dateRange, $tenantName);
        $this->accountId = $accountId;
    }

    public function headings(): array
    {
        return [
            'Date',
            'Account Code',
            'Account Name',
            'Reference',
            'Description',
            'Debit',
            'Credit',
            'Running Balance',
        ];
    }

    public function collection(): Collection
    {
        $query = ChartOfAccount::query()
            ->with(['journalLines' => function ($query) {
                $query->whereHas('journalEntry', function ($q) {
                    $q->where('status', 'posted');

                    if (!empty($this->dateRange)) {
                        if (isset($this->dateRange['from'])) {
                            $q->where('date', '>=', $this->dateRange['from']);
                        }
                        if (isset($this->dateRange['to'])) {
                            $q->where('date', '<=', $this->dateRange['to']);
                        }
                    }
                })
                ->with('journalEntry')
                ->orderBy('id');
            }])
            ->orderBy('code');

        if ($this->accountId) {
            $query->where('id', $this->accountId);
        }

        $accounts = $query->get();
        $data = collect();

        foreach ($accounts as $account) {
            if ($account->journalLines->isEmpty()) {
                continue;
            }

            $runningBalance = $this->getOpeningBalance($account);
            $isDebitNormal = in_array($account->type, ['asset', 'expense']);

            foreach ($account->journalLines as $line) {
                $journalEntry = $line->journalEntry;

                if ($isDebitNormal) {
                    $runningBalance += $line->debit - $line->credit;
                } else {
                    $runningBalance += $line->credit - $line->debit;
                }

                $data->push([
                    $this->formatDate($journalEntry->date),
                    $account->code,
                    $account->name,
                    $journalEntry->reference ?? $journalEntry->journal_number,
                    $line->description ?? $journalEntry->description ?? '-',
                    $this->formatCurrency($line->debit),
                    $this->formatCurrency($line->credit),
                    $this->formatCurrency(abs($runningBalance)) . ($runningBalance < 0 ? ' CR' : ' DR'),
                ]);
            }
        }

        return $data;
    }

    /**
     * Calculate opening balance for an account before the date range
     */
    protected function getOpeningBalance(ChartOfAccount $account): float
    {
        if (empty($this->dateRange['from'])) {
            return 0;
        }

        $lines = $account->journalLines()
            ->whereHas('journalEntry', function ($q) {
                $q->where('date', '<', $this->dateRange['from'])
                  ->where('status', 'posted');
            })
            ->get();

        $debit = $lines->sum('debit');
        $credit = $lines->sum('credit');

        $isDebitNormal = in_array($account->type, ['asset', 'expense']);

        return $isDebitNormal ? ($debit - $credit) : ($credit - $debit);
    }
}
