<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\PurchaseInvoice;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SSTReportService
{
    /**
     * Generate SST Summary Report
     * 
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return array
     */
    public function getSSTSummary(Carbon $startDate, Carbon $endDate): array
    {
        // Sales SST (Output Tax)
        $salesSST = Invoice::whereBetween('date', [$startDate, $endDate])
            ->where('status', '!=', 'void')
            ->selectRaw('
                SUM(subtotal) as total_sales,
                SUM(tax_amount) as total_sst,
                COUNT(*) as transaction_count
            ')
            ->first();

        // Purchase SST (Input Tax)
        $purchaseSST = PurchaseInvoice::whereBetween('date', [$startDate, $endDate])
            ->where('status', '!=', 'void')
            ->selectRaw('
                SUM(subtotal) as total_purchases,
                SUM(tax_amount) as total_sst,
                COUNT(*) as transaction_count
            ')
            ->first();

        // Detailed breakdown by tax rate
        $salesByRate = Invoice::whereBetween('date', [$startDate, $endDate])
            ->where('status', '!=', 'void')
            ->selectRaw('
                tax_percent,
                SUM(subtotal) as taxable_amount,
                SUM(tax_amount) as tax_collected,
                COUNT(*) as count
            ')
            ->groupBy('tax_percent')
            ->get();

        $purchasesByRate = PurchaseInvoice::whereBetween('date', [$startDate, $endDate])
            ->where('status', '!=', 'void')
            ->selectRaw('
                tax_percent,
                SUM(subtotal) as taxable_amount,
                SUM(tax_amount) as tax_paid,
                COUNT(*) as count
            ')
            ->groupBy('tax_percent')
            ->get();

        $netSSTPayable = ($salesSST->total_sst ?? 0) - ($purchaseSST->total_sst ?? 0);

        return [
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
            'sales' => [
                'total_sales' => $salesSST->total_sales ?? 0,
                'total_sst' => $salesSST->total_sst ?? 0,
                'transaction_count' => $salesSST->transaction_count ?? 0,
                'by_rate' => $salesByRate,
            ],
            'purchases' => [
                'total_purchases' => $purchaseSST->total_purchases ?? 0,
                'total_sst' => $purchaseSST->total_sst ?? 0,
                'transaction_count' => $purchaseSST->transaction_count ?? 0,
                'by_rate' => $purchasesByRate,
            ],
            'summary' => [
                'output_tax' => $salesSST->total_sst ?? 0,
                'input_tax' => $purchaseSST->total_sst ?? 0,
                'net_sst_payable' => $netSSTPayable,
            ],
        ];
    }
}
