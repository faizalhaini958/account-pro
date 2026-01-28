<?php

namespace App\Services\Posting\Contracts;

use Illuminate\Database\Eloquent\Model;

interface PostingRuleInterface
{
    /**
     * Get journal lines for the transaction
     * 
     * @param Model $transaction
     * @return array Array of journal lines with 'account_code', 'debit', 'credit', 'description'
     */
    public function getJournalLines(Model $transaction): array;

    /**
     * Get description for the journal entry
     * 
     * @param Model $transaction
     * @return string
     */
    public function getDescription(Model $transaction): string;

    /**
     * Get reference number for the journal entry
     * 
     * @param Model $transaction
     * @return string
     */
    public function getReference(Model $transaction): string;
}
