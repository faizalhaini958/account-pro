<?php

namespace App\Policies;

use App\Models\PurchaseInvoice;
use App\Models\User;

class PurchaseInvoicePolicy extends BasePolicy
{
    protected string $module = 'purchases';

    /**
     * Determine whether the user can post the purchase invoice.
     */
    public function post(User $user, PurchaseInvoice $invoice): bool
    {
        if (!$user->hasPermission('purchases.approve')) {
            return false;
        }

        return $invoice->status === 'draft';
    }

    /**
     * Determine whether the user can void the purchase invoice.
     */
    public function void(User $user, PurchaseInvoice $invoice): bool
    {
        if (!$user->hasPermission('purchases.approve')) {
            return false;
        }

        return $invoice->status === 'posted' && $invoice->amount_paid == 0;
    }

    /**
     * Determine whether the user can update the purchase invoice.
     */
    public function update(User $user, PurchaseInvoice $invoice): bool
    {
        if (!$user->hasPermission('purchases.edit')) {
            return false;
        }

        return $invoice->status === 'draft';
    }

    /**
     * Determine whether the user can delete the purchase invoice.
     */
    public function delete(User $user, PurchaseInvoice $invoice): bool
    {
        if (!$user->hasPermission('purchases.delete')) {
            return false;
        }

        return $invoice->status === 'draft';
    }
}
