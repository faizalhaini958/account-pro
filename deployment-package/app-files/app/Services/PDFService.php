<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class PDFService
{
    /**
     * Generate invoice PDF
     * 
     * @param mixed $invoice
     * @param string $view
     * @return \Barryvdh\DomPDF\PDF
     */
    public function generateInvoice($invoice, string $view = 'pdf.invoice')
    {
        $invoice->load(['customer', 'items']);
        
        return Pdf::loadView($view, [
            'invoice' => $invoice,
        ])->setPaper('a4');
    }

    /**
     * Generate Profit & Loss PDF
     * 
     * @param array $data
     * @return \Barryvdh\DomPDF\PDF
     */
    public function generateProfitAndLoss(array $data)
    {
        $tenant = \App\Services\TenantContext::getTenant();
        return Pdf::loadView('pdf.profit-and-loss', [
            'report' => $data,
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'tenant' => $tenant,
        ])->setPaper('a4');
    }

    /**
     * Generate Balance Sheet PDF
     * 
     * @param array $data
     * @return \Barryvdh\DomPDF\PDF
     */
    public function generateBalanceSheet(array $data)
    {
        $tenant = \App\Services\TenantContext::getTenant();
        return Pdf::loadView('pdf.balance-sheet', [
            'report' => $data,
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'tenant' => $tenant,
        ])->setPaper('a4');
    }

    /**
     * Generate Trial Balance PDF
     * 
     * @param array $data
     * @return \Barryvdh\DomPDF\PDF
     */
    public function generateTrialBalance(array $data)
    {
        $tenant = \App\Services\TenantContext::getTenant();
        return Pdf::loadView('pdf.trial-balance', [
            'report' => $data,
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'tenant' => $tenant,
        ])->setPaper('a4');
    }

    /**
     * Generate General Ledger PDF
     * 
     * @param array $data
     * @return \Barryvdh\DomPDF\PDF
     */
    public function generateGeneralLedger(array $data)
    {
        $tenant = \App\Services\TenantContext::getTenant();
        return Pdf::loadView('pdf.general-ledger', [
            'report' => $data,
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'tenant' => $tenant,
        ])->setPaper('a4', 'landscape');
    }

    /**
     * Generate AR Aging PDF
     * 
     * @param array $data
     * @return \Barryvdh\DomPDF\PDF
     */
    public function generateARAging(array $data)
    {
        $tenant = \App\Services\TenantContext::getTenant();
        return Pdf::loadView('pdf.ar-aging', [
            'report' => $data,
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'tenant' => $tenant,
        ])->setPaper('a4', 'landscape');
    }

    /**
     * Generate custom report PDF
     * 
     * @param string $view
     * @param array $data
     * @param string $orientation
     * @return \Barryvdh\DomPDF\PDF
     */
    public function generateCustomReport(string $view, array $data, string $orientation = 'portrait')
    {
        if (!isset($data['tenant'])) {
            $data['tenant'] = \App\Services\TenantContext::getTenant();
        }
        return Pdf::loadView($view, $data)->setPaper('a4', $orientation);
    }

    /**
     * Download PDF
     * 
     * @param \Barryvdh\DomPDF\PDF $pdf
     * @param string $filename
     * @return \Illuminate\Http\Response
     */
    public function download($pdf, string $filename)
    {
        return $pdf->download($filename);
    }

    /**
     * Stream PDF (display in browser)
     * 
     * @param \Barryvdh\DomPDF\PDF $pdf
     * @return \Illuminate\Http\Response
     */
    public function stream($pdf)
    {
        return $pdf->stream();
    }
}
