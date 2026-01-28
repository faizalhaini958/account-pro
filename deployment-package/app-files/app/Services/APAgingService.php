<?php

namespace App\Services;

use App\Models\PurchaseInvoice;
use Carbon\Carbon;

class APAgingService
{
    /**
     * Get AP Aging Report
     * 
     * @return array
     */
    public function getAPAging(): array
    {
        $invoices = PurchaseInvoice::where('status', '!=', 'void')
            ->where('outstanding_amount', '>', 0)
            ->with('supplier')
            ->get();
        
        $aging = [
            'current' => [],
            '1_30' => [],
            '31_60' => [],
            '61_90' => [],
            'over_90' => [],
        ];
        
        $totals = [
            'current' => 0,
            '1_30' => 0,
            '31_60' => 0,
            '61_90' => 0,
            'over_90' => 0,
        ];
        
        foreach ($invoices as $invoice) {
            $daysOverdue = now()->diffInDays($invoice->due_date, false);
            $category = $this->getAgingCategory($daysOverdue);
            
            $aging[$category][] = [
                'invoice_number' => $invoice->invoice_number,
                'supplier' => $invoice->supplier->name,
                'date' => $invoice->date->format('Y-m-d'),
                'due_date' => $invoice->due_date->format('Y-m-d'),
                'amount' => $invoice->outstanding_amount,
                'days_overdue' => max(0, -$daysOverdue),
            ];
            
            $totals[$category] += $invoice->outstanding_amount;
        }
        
        return [
            'aging' => $aging,
            'totals' => $totals,
            'grand_total' => array_sum($totals),
        ];
    }

    /**
     * Determine aging category
     * 
     * @param int $daysOverdue
     * @return string
     */
    protected function getAgingCategory(int $daysOverdue): string
    {
        if ($daysOverdue >= 0) {
            return 'current';
        } elseif ($daysOverdue >= -30) {
            return '1_30';
        } elseif ($daysOverdue >= -60) {
            return '31_60';
        } elseif ($daysOverdue >= -90) {
            return '61_90';
        } else {
            return 'over_90';
        }
    }
}
