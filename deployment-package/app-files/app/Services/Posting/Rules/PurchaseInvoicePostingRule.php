<?php

namespace App\Services\Posting\Rules;

use App\Models\PurchaseInvoice;
use App\Services\Posting\Contracts\PostingRuleInterface;
use App\Services\Posting\GLAccountResolver;
use Illuminate\Database\Eloquent\Model;

class PurchaseInvoicePostingRule implements PostingRuleInterface
{
    protected GLAccountResolver $glResolver;

    public function __construct(GLAccountResolver $glResolver)
    {
        $this->glResolver = $glResolver;
    }

    public function getJournalLines(Model $transaction): array
    {
        /** @var PurchaseInvoice $transaction */
        $lines = [];

        // Dr: Inventory/Expense (simplified - using inventory for now)
        $inventoryAccountId = $this->glResolver->getAccountId('inventory', '1400');
        if (!$inventoryAccountId) {
            throw new \Exception('Inventory account not configured');
        }

        $lines[] = [
            'account_id' => $inventoryAccountId,
            'debit' => $transaction->subtotal,
            'credit' => 0,
            'description' => 'Inventory Purchase',
        ];

        // Dr: Tax Input (if applicable)
        if ($transaction->tax_amount > 0) {
            $taxInputAccountId = $this->glResolver->getAccountId('tax_input', '1302');
            if (!$taxInputAccountId) {
                throw new \Exception('Tax input account not configured');
            }

            $lines[] = [
                'account_id' => $taxInputAccountId,
                'debit' => $transaction->tax_amount,
                'credit' => 0,
                'description' => 'SST Input Tax',
            ];
        }

        // Cr: Accounts Payable
        $apAccountId = $this->glResolver->getAccountId('ap_account', '2100');
        if (!$apAccountId) {
            throw new \Exception('AP account not configured');
        }

        $lines[] = [
            'account_id' => $apAccountId,
            'debit' => 0,
            'credit' => $transaction->total_amount,
            'description' => 'Accounts Payable - ' . $transaction->supplier->name,
        ];

        return $lines;
    }

    public function getDescription(Model $transaction): string
    {
        /** @var PurchaseInvoice $transaction */
        return "Purchase Invoice {$transaction->invoice_number} - {$transaction->supplier->name}";
    }

    public function getReference(Model $transaction): string
    {
        /** @var PurchaseInvoice $transaction */
        return $transaction->invoice_number;
    }
}
