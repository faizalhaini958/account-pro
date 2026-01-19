<?php

namespace App\Observers;

use App\Models\EInvoiceDocument;
use App\Notifications\EInvoiceRejectedNotification;
use App\Notifications\EInvoiceSubmittedNotification;
use App\Notifications\EInvoiceValidatedNotification;

class EInvoiceDocumentObserver
{
    /**
     * Handle the EInvoiceDocument "created" event.
     */
    public function created(EInvoiceDocument $eInvoiceDocument): void
    {
        // Notify when e-Invoice is first submitted
        if ($eInvoiceDocument->status === 'submitted') {
            $eInvoiceDocument->invoice->tenant->users->each(function ($user) use ($eInvoiceDocument) {
                $user->notify(new EInvoiceSubmittedNotification(
                    $eInvoiceDocument->invoice,
                    $eInvoiceDocument
                ));
            });
        }
    }

    /**
     * Handle the EInvoiceDocument "updated" event.
     */
    public function updated(EInvoiceDocument $eInvoiceDocument): void
    {
        // Check if status changed
        if ($eInvoiceDocument->isDirty('status')) {
            $newStatus = $eInvoiceDocument->status;
            $oldStatus = $eInvoiceDocument->getOriginal('status');

            // Notify when validated
            if ($newStatus === 'validated' && $oldStatus !== 'validated') {
                $eInvoiceDocument->invoice->tenant->users->each(function ($user) use ($eInvoiceDocument) {
                    $user->notify(new EInvoiceValidatedNotification(
                        $eInvoiceDocument->invoice,
                        $eInvoiceDocument
                    ));
                });
            }

            // Notify when rejected/failed
            if (in_array($newStatus, ['rejected', 'failed']) && !in_array($oldStatus, ['rejected', 'failed'])) {
                $eInvoiceDocument->invoice->tenant->users->each(function ($user) use ($eInvoiceDocument) {
                    $user->notify(new EInvoiceRejectedNotification(
                        $eInvoiceDocument->invoice,
                        $eInvoiceDocument
                    ));
                });
            }
        }
    }
}
