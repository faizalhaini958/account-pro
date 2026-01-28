<?php

namespace App\Services;

use SimpleSoftwareIO\QrCode\Facades\QrCode;
use App\Models\Invoice;
use App\Models\EInvoiceDocument;

class QRCodeService
{
    /**
     * Generate QR code data URL for invoice
     * For e-Invoice compliance, the QR contains a URL to verify the document
     */
    public function generateInvoiceQRCode(Invoice $invoice): string
    {
        $qrData = $this->buildInvoiceQRData($invoice);

        return $this->generateBase64QRCode($qrData);
    }

    /**
     * Generate QR code for e-Invoice document
     */
    public function generateEInvoiceQRCode(EInvoiceDocument $document): string
    {
        // For LHDN e-Invoice, the QR should contain the validation URL
        $validationUrl = $document->validation_url ?? $this->buildValidationUrl($document);

        return $this->generateBase64QRCode($validationUrl);
    }

    /**
     * Build QR data payload for invoice
     */
    protected function buildInvoiceQRData(Invoice $invoice): string
    {
        // Check if there's an e-invoice document linked
        $eInvoiceDocument = EInvoiceDocument::where('invoice_id', $invoice->id)
            ->where('status', 'valid')
            ->first();

        if ($eInvoiceDocument && $eInvoiceDocument->validation_url) {
            return $eInvoiceDocument->validation_url;
        }

        // Fallback: Create a structured data string with invoice info
        // This follows common invoice QR formats (similar to ZATCA, LHDN requirements)
        $data = [
            'seller' => $invoice->tenant?->name ?? config('app.name'),
            'tax_id' => $invoice->tenant?->tax_number ?? '',
            'date' => $invoice->date->format('Y-m-d'),
            'total' => number_format($invoice->total, 2, '.', ''),
            'tax' => number_format($invoice->tax_amount, 2, '.', ''),
            'ref' => $invoice->reference_number ?? $invoice->invoice_number,
        ];

        // Format as TLV (Tag-Length-Value) or simple JSON
        return json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    /**
     * Build LHDN e-Invoice validation URL
     */
    protected function buildValidationUrl(EInvoiceDocument $document): string
    {
        // LHDN MyInvois validation URL format
        $baseUrl = config('services.einvoice.validation_url', 'https://myinvois.hasil.gov.my/');

        return $baseUrl . ($document->uuid ?? $document->id);
    }

    /**
     * Generate base64 encoded QR code image
     */
    protected function generateBase64QRCode(string $data, int $size = 150): string
    {
        $qrCode = QrCode::format('png')
            ->size($size)
            ->margin(1)
            ->errorCorrection('M')
            ->generate($data);

        return 'data:image/png;base64,' . base64_encode($qrCode);
    }

    /**
     * Generate QR code as SVG for better quality
     */
    public function generateSVGQRCode(string $data, int $size = 150): string
    {
        return QrCode::format('svg')
            ->size($size)
            ->margin(1)
            ->errorCorrection('M')
            ->generate($data);
    }
}
