<?php

namespace App\Services;

use App\Models\JournalEntry;
use App\Models\Invoice;
use App\Models\PurchaseInvoice;
use App\Models\Receipt;
use App\Models\SupplierPayment;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AuditTrailService
{
    /**
     * Get audit trail for a date range
     * 
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @param string|null $type
     * @return array
     */
    public function getAuditTrail(Carbon $startDate, Carbon $endDate, ?string $type = null): array
    {
        $activities = collect();

        // Journal Entries
        if (!$type || $type === 'journal') {
            $journals = JournalEntry::whereBetween('created_at', [$startDate, $endDate])
                ->with('createdBy')
                ->get()
                ->map(function ($entry) {
                    return [
                        'type' => 'Journal Entry',
                        'reference' => $entry->number ?? 'JE-' . $entry->id,
                        'description' => $entry->description,
                        'user' => $entry->createdBy->name ?? 'System',
                        'date' => $entry->created_at->format('Y-m-d H:i:s'),
                        'amount' => $entry->lines->sum('debit'),
                        'status' => $entry->posted ? 'Posted' : 'Draft',
                    ];
                });
            $activities = $activities->merge($journals);
        }

        // Sales Invoices
        if (!$type || $type === 'sales') {
            $invoices = Invoice::whereBetween('created_at', [$startDate, $endDate])
                ->with('customer')
                ->get()
                ->map(function ($invoice) {
                    return [
                        'type' => 'Sales Invoice',
                        'reference' => $invoice->reference_number,
                        'description' => 'Invoice to ' . $invoice->customer->name,
                        'user' => 'System',
                        'date' => $invoice->created_at->format('Y-m-d H:i:s'),
                        'amount' => $invoice->total,
                        'status' => ucfirst($invoice->status),
                    ];
                });
            $activities = $activities->merge($invoices);
        }

        // Purchase Invoices
        if (!$type || $type === 'purchase') {
            $purchases = PurchaseInvoice::whereBetween('created_at', [$startDate, $endDate])
                ->with('supplier')
                ->get()
                ->map(function ($invoice) {
                    return [
                        'type' => 'Purchase Invoice',
                        'reference' => $invoice->invoice_number,
                        'description' => 'Invoice from ' . $invoice->supplier->name,
                        'user' => 'System',
                        'date' => $invoice->created_at->format('Y-m-d H:i:s'),
                        'amount' => $invoice->total,
                        'status' => ucfirst($invoice->status),
                    ];
                });
            $activities = $activities->merge($purchases);
        }

        // Receipts
        if (!$type || $type === 'receipt') {
            $receipts = Receipt::whereBetween('created_at', [$startDate, $endDate])
                ->with('customer')
                ->get()
                ->map(function ($receipt) {
                    return [
                        'type' => 'Customer Receipt',
                        'reference' => $receipt->reference_number,
                        'description' => 'Payment from ' . $receipt->customer->name,
                        'user' => 'System',
                        'date' => $receipt->created_at->format('Y-m-d H:i:s'),
                        'amount' => $receipt->amount,
                        'status' => 'Completed',
                    ];
                });
            $activities = $activities->merge($receipts);
        }

        // Supplier Payments
        if (!$type || $type === 'payment') {
            $payments = SupplierPayment::whereBetween('created_at', [$startDate, $endDate])
                ->with('supplier')
                ->get()
                ->map(function ($payment) {
                    return [
                        'type' => 'Supplier Payment',
                        'reference' => $payment->reference_number,
                        'description' => 'Payment to ' . $payment->supplier->name,
                        'user' => 'System',
                        'date' => $payment->created_at->format('Y-m-d H:i:s'),
                        'amount' => $payment->amount,
                        'status' => 'Completed',
                    ];
                });
            $activities = $activities->merge($payments);
        }

        // Sort by date descending
        $activities = $activities->sortByDesc('date')->values();

        return [
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
            'filter' => $type ?? 'all',
            'activities' => $activities->toArray(),
            'total_count' => $activities->count(),
        ];
    }
}
