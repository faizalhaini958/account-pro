<?php

namespace App\Policies;

use App\Models\JournalEntry;
use App\Models\User;

class JournalEntryPolicy extends BasePolicy
{
    protected string $module = 'accounting';

    /**
     * Determine whether the user can post the journal entry.
     */
    public function post(User $user, JournalEntry $journal): bool
    {
        if (!$user->hasPermission('accounting.approve')) {
            return false;
        }

        return $journal->status === 'draft';
    }

    /**
     * Determine whether the user can reverse the journal entry.
     */
    public function reverse(User $user, JournalEntry $journal): bool
    {
        if (!$user->hasPermission('accounting.approve')) {
            return false;
        }

        return $journal->status === 'posted';
    }

    /**
     * Determine whether the user can update the journal entry.
     */
    public function update(User $user, JournalEntry $journal): bool
    {
        if (!$user->hasPermission('accounting.edit')) {
            return false;
        }

        // Can only edit draft entries
        return $journal->status === 'draft';
    }

    /**
     * Determine whether the user can delete the journal entry.
     */
    public function delete(User $user, JournalEntry $journal): bool
    {
        if (!$user->hasPermission('accounting.delete')) {
            return false;
        }

        // Can only delete draft entries
        return $journal->status === 'draft';
    }
}
