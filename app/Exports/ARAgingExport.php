<?php

namespace App\Exports;

use App\Models\Customer;
use App\Models\Invoice;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class ARAgingExport extends BaseExport
{
    protected string $title = 'AR Aging Report';
    protected ?string $asOfDate = null;

    public function __construct(
        array $dateRange = [],
        ?string $tenantName = null,
        ?string $asOfDate = null
    ) {
        parent::__construct($dateRange, $tenantName);
        $this->asOfDate = $asOfDate ?? now()->toDateString();
    }

    public function headings(): array
    {
        return [
            'Customer',
            'Current',
            '1-30 Days',
            '31-60 Days',
            '61-90 Days',
            'Over 90 Days',
            'Total Outstanding',
        ];
    }

    public function collection(): Collection
    {
        $asOfDate = Carbon::parse($this->asOfDate);

        $customers = Customer::with(['invoices' => function ($query) use ($asOfDate) {
            $query->where('date', '<=', $asOfDate)
                  ->where('status', 'posted')
                  ->whereColumn('amount_paid', '<', 'total');
        }])
        ->whereHas('invoices', function ($query) use ($asOfDate) {
            $query->where('date', '<=', $asOfDate)
                  ->where('status', 'posted')
                  ->whereColumn('amount_paid', '<', 'total');
        })
        ->orderBy('name')
        ->get();

        $data = collect();
        $totals = [
            'current' => 0,
            '1_30' => 0,
            '31_60' => 0,
            '61_90' => 0,
            'over_90' => 0,
            'total' => 0,
        ];

        foreach ($customers as $customer) {
            $aging = [
                'current' => 0,
                '1_30' => 0,
                '31_60' => 0,
                '61_90' => 0,
                'over_90' => 0,
            ];

            foreach ($customer->invoices as $invoice) {
                $balance = $invoice->total - $invoice->amount_paid;
                $dueDate = Carbon::parse($invoice->due_date);
                $daysOverdue = $asOfDate->diffInDays($dueDate, false);

                if ($daysOverdue <= 0) {
                    $aging['current'] += $balance;
                } elseif ($daysOverdue <= 30) {
                    $aging['1_30'] += $balance;
                } elseif ($daysOverdue <= 60) {
                    $aging['31_60'] += $balance;
                } elseif ($daysOverdue <= 90) {
                    $aging['61_90'] += $balance;
                } else {
                    $aging['over_90'] += $balance;
                }
            }

            $customerTotal = array_sum($aging);

            if ($customerTotal > 0) {
                $data->push([
                    $customer->name,
                    $this->formatCurrency($aging['current']),
                    $this->formatCurrency($aging['1_30']),
                    $this->formatCurrency($aging['31_60']),
                    $this->formatCurrency($aging['61_90']),
                    $this->formatCurrency($aging['over_90']),
                    $this->formatCurrency($customerTotal),
                ]);

                $totals['current'] += $aging['current'];
                $totals['1_30'] += $aging['1_30'];
                $totals['31_60'] += $aging['31_60'];
                $totals['61_90'] += $aging['61_90'];
                $totals['over_90'] += $aging['over_90'];
                $totals['total'] += $customerTotal;
            }
        }

        // Add totals row
        $data->push([
            'TOTAL',
            $this->formatCurrency($totals['current']),
            $this->formatCurrency($totals['1_30']),
            $this->formatCurrency($totals['31_60']),
            $this->formatCurrency($totals['61_90']),
            $this->formatCurrency($totals['over_90']),
            $this->formatCurrency($totals['total']),
        ]);

        return $data;
    }
}
