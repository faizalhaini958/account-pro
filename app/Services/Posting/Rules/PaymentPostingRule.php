<?php

namespace App\Services\Posting\Rules;

use App\Models\SupplierPayment;
use App\Services\Posting\Contracts\PostingRuleInterface;
use App\Services\Posting\GLAccountResolver;
use Illuminate\Database\Eloquent\Model;

class PaymentPostingRule implements PostingRuleInterface
{
    protected GLAccountResolver $glResolver;

    public function __construct(GLAccountResolver $glResolver)
    {
        $this->glResolver = $glResolver;
    }

    public function getJournalLines(Model $transaction): array
    {
        /** @var SupplierPayment $transaction */
        $lines = [];

        // Dr: Accounts Payable
        $apAccountId = $this->glResolver->getAccountId('ap_account', '2100');
        if (!$apAccountId) {
            throw new \Exception('AP account not configured');
        }

        $lines[] = [
            'account_id' => $apAccountId,
            'debit' => $transaction->amount,
            'credit' => 0,
            'description' => 'Payment to ' . $transaction->supplier->name,
        ];

        // Cr: Bank/Cash Account
        $bankAccountId = $transaction->bankAccount->chart_of_account_id;
        if (!$bankAccountId) {
            throw new \Exception('Bank account not linked to chart of accounts');
        }

        $lines[] = [
            'account_id' => $bankAccountId,
            'debit' => 0,
            'credit' => $transaction->amount,
            'description' => 'Payment made to ' . $transaction->supplier->name,
        ];

        return $lines;
    }

    public function getDescription(Model $transaction): string
    {
        /** @var SupplierPayment $transaction */
        return "Payment {$transaction->reference_number} to {$transaction->supplier->name}";
    }

    public function getReference(Model $transaction): string
    {
        /** @var SupplierPayment $transaction */
        return $transaction->reference_number;
    }
}
