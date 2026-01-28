<?php

namespace App\Services\Posting\Rules;

use App\Models\Invoice;
use App\Services\Posting\Contracts\PostingRuleInterface;
use App\Services\Posting\GLAccountResolver;
use Illuminate\Database\Eloquent\Model;

class SalesInvoicePostingRule implements PostingRuleInterface
{
    protected GLAccountResolver $glResolver;

    public function __construct(GLAccountResolver $glResolver)
    {
        $this->glResolver = $glResolver;
    }

    public function getJournalLines(Model $transaction): array
    {
        /** @var Invoice $transaction */
        $lines = [];

        // Dr: Accounts Receivable
        $arAccountId = $this->glResolver->getAccountId('ar_account', '1200');
        if (!$arAccountId) {
            throw new \Exception('AR account not configured');
        }

        $lines[] = [
            'account_id' => $arAccountId,
            'debit' => $transaction->total,
            'credit' => 0,
            'description' => 'Accounts Receivable - ' . $transaction->customer->name,
        ];

        // Cr: Sales Revenue
        $salesAccountId = $this->glResolver->getAccountId('sales_account', '4100');
        if (!$salesAccountId) {
            throw new \Exception('Sales account not configured');
        }

        $lines[] = [
            'account_id' => $salesAccountId,
            'debit' => 0,
            'credit' => $transaction->subtotal,
            'description' => 'Sales Revenue',
        ];

        // Cr: Tax Payable (if applicable)
        if ($transaction->tax_amount > 0) {
            $taxAccountId = $this->glResolver->getAccountId('tax_payable', '2102');
            if (!$taxAccountId) {
                throw new \Exception('Tax payable account not configured');
            }

            $lines[] = [
                'account_id' => $taxAccountId,
                'debit' => 0,
                'credit' => $transaction->tax_amount,
                'description' => 'SST Payable',
            ];
        }

        return $lines;
    }

    public function getDescription(Model $transaction): string
    {
        /** @var Invoice $transaction */
        return "Sales Invoice {$transaction->number} - {$transaction->customer->name}";
    }

    public function getReference(Model $transaction): string
    {
        /** @var Invoice $transaction */
        return $transaction->number;
    }
}
