<?php

namespace App\Exports;

use App\Models\PurchaseInvoice;
use Illuminate\Support\Collection;

class PurchaseInvoiceExport extends BaseExport
{
    protected string $title = 'Purchase Invoices';
    protected ?string $status = null;
    protected ?int $supplierId = null;

    public function __construct(
        array $dateRange = [],
        ?string $tenantName = null,
        ?string $status = null,
        ?int $supplierId = null
    ) {
        parent::__construct($dateRange, $tenantName);
        $this->status = $status;
        $this->supplierId = $supplierId;
    }

    public function headings(): array
    {
        return [
            'Invoice No.',
            'Supplier Invoice',
            'Date',
            'Due Date',
            'Supplier',
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
        $query = PurchaseInvoice::with('supplier')
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

        if ($this->supplierId) {
            $query->where('supplier_id', $this->supplierId);
        }

        return $query->get()->map(function ($invoice) {
            return [
                $invoice->invoice_number,
                $invoice->supplier_invoice_number ?? '-',
                $this->formatDate($invoice->date),
                $this->formatDate($invoice->due_date),
                $invoice->supplier?->name ?? '-',
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
