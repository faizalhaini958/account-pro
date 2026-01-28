<?php

namespace App\Policies;

use App\Models\Quotation;
use App\Models\User;

class QuotationPolicy extends BasePolicy
{
    protected string $module = 'sales';

    /**
     * Determine whether the user can mark quotation as sent.
     */
    public function markAsSent(User $user, Quotation $quotation): bool
    {
        if (!$user->hasPermission('sales.edit')) {
            return false;
        }

        return $quotation->status === 'draft';
    }

    /**
     * Determine whether the user can accept the quotation.
     */
    public function accept(User $user, Quotation $quotation): bool
    {
        if (!$user->hasPermission('sales.approve')) {
            return false;
        }

        return in_array($quotation->status, ['draft', 'sent']);
    }

    /**
     * Determine whether the user can reject the quotation.
     */
    public function reject(User $user, Quotation $quotation): bool
    {
        if (!$user->hasPermission('sales.approve')) {
            return false;
        }

        return in_array($quotation->status, ['draft', 'sent']);
    }

    /**
     * Determine whether the user can convert quotation to invoice.
     */
    public function convert(User $user, Quotation $quotation): bool
    {
        if (!$user->hasPermission('sales.create')) {
            return false;
        }

        return $quotation->status === 'accepted';
    }

    /**
     * Determine whether the user can update the quotation.
     */
    public function update(User $user, Quotation $quotation): bool
    {
        if (!$user->hasPermission('sales.edit')) {
            return false;
        }

        // Can only edit draft or sent quotations
        return in_array($quotation->status, ['draft', 'sent']);
    }

    /**
     * Determine whether the user can delete the quotation.
     */
    public function delete(User $user, Quotation $quotation): bool
    {
        if (!$user->hasPermission('sales.delete')) {
            return false;
        }

        // Can only delete draft quotations
        return $quotation->status === 'draft';
    }
}
