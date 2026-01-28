<?php

namespace App\Policies;

use App\Models\ChartOfAccount;
use App\Models\User;

class ChartOfAccountPolicy extends BasePolicy
{
    protected string $module = 'accounting';

    /**
     * Determine whether the user can delete the account.
     */
    public function delete(User $user, ChartOfAccount $account): bool
    {
        if (!$user->hasPermission('accounting.delete')) {
            return false;
        }

        // Cannot delete system accounts
        if ($account->is_system) {
            return false;
        }

        // Cannot delete accounts with transactions
        if ($account->journalLines()->exists()) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can update the account.
     */
    public function update(User $user, ChartOfAccount $account): bool
    {
        if (!$user->hasPermission('accounting.edit')) {
            return false;
        }

        // Can edit non-system accounts, or only certain fields of system accounts
        return true;
    }
}
