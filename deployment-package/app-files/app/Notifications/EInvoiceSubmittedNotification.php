<?php

namespace App\Notifications;

use App\Models\EInvoiceDocument;
use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EInvoiceSubmittedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Invoice $invoice,
        public EInvoiceDocument $eInvoiceDocument
    ) {
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('e-Invoice Submitted Successfully')
            ->view('emails.einvoice.submitted', [
                'invoice' => $this->invoice,
                'eInvoiceDocument' => $this->eInvoiceDocument,
            ]);
    }
}
