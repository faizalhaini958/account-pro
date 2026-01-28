<?php

namespace App\Services;

use App\Models\JournalEntry;
use App\Models\JournalLine;
use App\Services\Posting\Contracts\PostingRuleInterface;
use App\Services\Posting\GLAccountResolver;
use App\Services\TenantContext;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class PostingService
{
    protected GLAccountResolver $glResolver;

    public function __construct(GLAccountResolver $glResolver)
    {
        $this->glResolver = $glResolver;
    }

    /**
     * Post a transaction to the general ledger
     * 
     * @param Model $transaction
     * @param PostingRuleInterface $rule
     * @return JournalEntry
     * @throws \Exception
     */
    public function post(Model $transaction, PostingRuleInterface $rule): JournalEntry
    {
        return DB::transaction(function () use ($transaction, $rule) {
            // Get journal lines from the rule
            $lines = $rule->getJournalLines($transaction);
            
            // Validate double-entry
            $this->validateDoubleEntry($lines);
            
            // Create journal entry
            $entry = JournalEntry::create([
                'number' => $this->generateEntryNumber(),
                'date' => $transaction->date ?? now(),
                'description' => $rule->getDescription($transaction),
                'reference_number' => $rule->getReference($transaction), // Map reference -> reference_number
                'reference_type' => $transaction->getMorphClass(), // Map source_type -> reference_type
                'reference_id' => $transaction->getKey(), // Map source_id -> reference_id
                'status' => 'posted',
                'posted_at' => now(),
            ]);

            // Create journal lines
            foreach ($lines as $line) {
                if (!empty($line['debit']) && $line['debit'] > 0) {
                    JournalLine::create([
                        'journal_entry_id' => $entry->id,
                        'account_id' => $line['account_id'],
                        'type' => 'debit',
                        'amount' => $line['debit'],
                        'description' => $line['description'] ?? $rule->getDescription($transaction),
                    ]);
                }

                if (!empty($line['credit']) && $line['credit'] > 0) {
                    JournalLine::create([
                        'journal_entry_id' => $entry->id,
                        'account_id' => $line['account_id'],
                        'type' => 'credit',
                        'amount' => $line['credit'],
                        'description' => $line['description'] ?? $rule->getDescription($transaction),
                    ]);
                }
            }

            return $entry->fresh(['lines']);
        });
    }

    /**
     * Reverse a journal entry (for void operations)
     * 
     * @param JournalEntry $entry
     * @param string $reason
     * @return JournalEntry
     */
    public function reverse(JournalEntry $entry, string $reason = 'Reversal'): JournalEntry
    {
        return DB::transaction(function () use ($entry, $reason) {
            // Mark original as void
            $entry->update(['status' => 'void']);

            // Create reversal entry
            $reversalEntry = JournalEntry::create([
                'number' => $this->generateEntryNumber(),
                'date' => now(),
                'description' => $reason . ' - ' . $entry->description,
                'reference_number' => 'REV-' . $entry->number,
                'status' => 'posted',
                'posted_at' => now(),
                'reference_type' => $entry->reference_type,
                'reference_id' => $entry->reference_id,
            ]);

            // Create reversed lines (swap debit/credit)
            foreach ($entry->lines as $line) {
                // If original was debit, new is credit
                $newType = $line->type === 'debit' ? 'credit' : 'debit';
                
                JournalLine::create([
                    'journal_entry_id' => $reversalEntry->id,
                    'account_id' => $line->account_id,
                    'description' => $line->description,
                    'type' => $newType,
                    'amount' => $line->amount,
                ]);
            }

            return $reversalEntry->fresh(['lines']);
        });
    }

    /**
     * Validate that debits equal credits
     * 
     * @param array $lines
     * @throws \Exception
     */
    protected function validateDoubleEntry(array $lines): void
    {
        $totalDebit = collect($lines)->sum('debit');
        $totalCredit = collect($lines)->sum('credit');

        if (abs($totalDebit - $totalCredit) > 0.01) {
            throw new \Exception("Journal entry is not balanced. Debits: {$totalDebit}, Credits: {$totalCredit}");
        }
    }

    /**
     * Generate next entry number
     * 
     * @return string
     */
    protected function generateEntryNumber(): string
    {
        $tenant = TenantContext::getTenant();
        $prefix = 'JE-';
        
        $lastEntry = JournalEntry::where('tenant_id', $tenant->id)
            ->where('number', 'like', $prefix . '%')
            ->orderBy('id', 'desc')
            ->first();

        if ($lastEntry) {
            $lastNumber = (int) str_replace($prefix, '', $lastEntry->number);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return $prefix . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Get GL Account Resolver
     * 
     * @return GLAccountResolver
     */
    public function getGLResolver(): GLAccountResolver
    {
        return $this->glResolver;
    }
}
