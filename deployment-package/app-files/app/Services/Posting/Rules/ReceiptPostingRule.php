<?php

namespace App\Services\Posting\Rules;

use App\Models\Receipt;
use App\Services\Posting\Contracts\PostingRuleInterface;
use App\Services\Posting\GLAccountResolver;
use Illuminate\Database\Eloquent\Model;

class ReceiptPostingRule implements PostingRuleInterface
{
    protected GLAccountResolver $glResolver;

    public function __construct(GLAccountResolver $glResolver)
    {
        $this->glResolver = $glResolver;
    }

    public function getJournalLines(Model $transaction): array
    {
        /** @var Receipt $transaction */
        $lines = [];

        // Dr: Bank/Cash Account
        $bankAccountId = $transaction->bankAccount->account_id;
        if (!$bankAccountId) {
            throw new \Exception('Bank account not linked to chart of accounts');
        }

        $lines[] = [
            'account_id' => $bankAccountId,
            'debit' => $transaction->amount,
            'credit' => 0,
            'description' => 'Receipt from ' . $transaction->customer->name,
        ];

        // Cr: Accounts Receivable
        $arAccountId = $this->glResolver->getAccountId('ar_account', '1200');
        if (!$arAccountId) {
            throw new \Exception('AR account not configured');
        }

        $lines[] = [
            'account_id' => $arAccountId,
            'debit' => 0,
            'credit' => $transaction->amount,
            'description' => 'Payment received from ' . $transaction->customer->name,
        ];

        return $lines;
    }

    public function getDescription(Model $transaction): string
    {
        /** @var Receipt $transaction */
        return "Receipt {$transaction->number} from {$transaction->customer->name}";
    }

    public function getReference(Model $transaction): string
    {
        /** @var Receipt $transaction */
        return $transaction->number;
    }
}
