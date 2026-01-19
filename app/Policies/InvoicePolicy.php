<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy extends BasePolicy
{
    protected string $module = 'sales';

    /**
     * Determine whether the user can post the invoice.
     */
    public function post(User $user, Invoice $invoice): bool
    {
        if (!$user->hasPermission('sales.approve')) {
            return false;
        }

        // Can only post draft invoices
        return $invoice->status === 'draft';
    }

    /**
     * Determine whether the user can void the invoice.
     */
    public function void(User $user, Invoice $invoice): bool
    {
        if (!$user->hasPermission('sales.approve')) {
            return false;
        }

        // Can only void posted invoices that haven't been paid
        return $invoice->status === 'posted' && $invoice->amount_paid == 0;
    }

    /**
     * Determine whether the user can update the invoice.
     */
    public function update(User $user, $model): bool
    {
        if (!$user->hasPermission('sales.edit')) {
            return false;
        }

        // Can only edit draft invoices
        return $model->status === 'draft';
    }

    /**
     * Determine whether the user can delete the invoice.
     */
    public function delete(User $user, $model): bool
    {
        if (!$user->hasPermission('sales.delete')) {
            return false;
        }

        // Can only delete draft invoices
        return $model->status === 'draft';
    }

    /**
     * Determine whether the user can generate PDF.
     */
    public function pdf(User $user, Invoice $invoice): bool
    {
        return $user->hasPermission('sales.view');
    }
}
