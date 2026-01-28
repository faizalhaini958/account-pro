<?php

namespace App\Exports;

use App\Models\Invoice;
use Illuminate\Support\Collection;
use App\Services\TenantContext;

class SalesInvoiceExport extends BaseExport
{
    protected string $title = 'Sales Invoices';
    protected ?string $status = null;
    protected ?int $customerId = null;

    public function __construct(
        array $dateRange = [],
        ?string $tenantName = null,
        ?string $status = null,
        ?int $customerId = null
    ) {
        parent::__construct($dateRange, $tenantName);
        $this->status = $status;
        $this->customerId = $customerId;
    }

    public function headings(): array
    {
        return [
            'Invoice No.',
            'Date',
            'Due Date',
            'Customer',
            'Subtotal',
            'Tax',
            'Total',
            'Amount Paid',
            'Balance',
            'Status',
        ];
    }

    public function collection(): Collection
    {
        $query = Invoice::with('customer')
            ->orderBy('date', 'desc');

        if (!empty($this->dateRange)) {
            if (isset($this->dateRange['from'])) {
                $query->where('date', '>=', $this->dateRange['from']);
            }
            if (isset($this->dateRange['to'])) {
                $query->where('date', '<=', $this->dateRange['to']);
            }
        }

        if ($this->status) {
            $query->where('status', $this->status);
        }

        if ($this->customerId) {
            $query->where('customer_id', $this->customerId);
        }

        return $query->get()->map(function ($invoice) {
            return [
                $invoice->invoice_number,
                $this->formatDate($invoice->date),
                $this->formatDate($invoice->due_date),
                $invoice->customer?->name ?? '-',
                $this->formatCurrency($invoice->subtotal),
                $this->formatCurrency($invoice->tax_amount),
                $this->formatCurrency($invoice->total),
                $this->formatCurrency($invoice->amount_paid),
                $this->formatCurrency($invoice->balance),
                ucfirst($invoice->status),
            ];
        });
    }
}
