<?php

namespace App\Traits;

use App\Mail\InvoiceMail;
use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

trait SendsInvoiceEmails
{
    /**
     * Send an invoice via email to the customer
     */
    protected function sendInvoiceEmail(Invoice $invoice): bool
    {
        if (!$invoice->customer || !$invoice->customer->email) {
            return false;
        }

        try {
            // Generate PDF
            $pdf = Pdf::loadView('pdf.invoice', ['invoice' => $invoice]);
            $pdfPath = storage_path('app/temp/invoice-' . $invoice->invoice_number . '.pdf');

            // Ensure temp directory exists
            if (!is_dir(storage_path('app/temp'))) {
                mkdir(storage_path('app/temp'), 0755, true);
            }

            $pdf->save($pdfPath);

            // Send email with PDF attachment
            Mail::to($invoice->customer->email)->send(
                new InvoiceMail($invoice, $invoice->customer, $pdfPath)
            );

            // Clean up temp file
            if (file_exists($pdfPath)) {
                unlink($pdfPath);
            }

            // Update invoice to mark as sent
            $invoice->update([
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send invoice email: ' . $e->getMessage());
            return false;
        }
    }
}
