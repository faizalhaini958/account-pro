<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Response;

class ExportService
{
    /**
     * Export data to CSV
     * 
     * @param Collection|array $data
     * @param array $headers
     * @param string $filename
     * @return \Illuminate\Http\Response
     */
    public function toCSV($data, array $headers, string $filename = 'export.csv')
    {
        $data = $data instanceof Collection ? $data->toArray() : $data;
        
        $callback = function() use ($data, $headers) {
            $file = fopen('php://output', 'w');
            
            // Write headers
            fputcsv($file, $headers);
            
            // Write data rows
            foreach ($data as $row) {
                fputcsv($file, $row);
            }
            
            fclose($file);
        };
        
        return Response::stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Export Profit & Loss to CSV
     * 
     * @param array $data
     * @return \Illuminate\Http\Response
     */
    public function profitAndLossToCSV(array $data)
    {
        $rows = [];
        
        // Income section
        $rows[] = ['INCOME', '', ''];
        foreach ($data['income']['accounts'] as $account) {
            $rows[] = [$account['account_code'], $account['account_name'], $account['amount']];
        }
        $rows[] = ['', 'Total Income', $data['income']['total']];
        $rows[] = ['', '', ''];
        
        // Expenses section
        $rows[] = ['EXPENSES', '', ''];
        foreach ($data['expenses']['accounts'] as $account) {
            $rows[] = [$account['account_code'], $account['account_name'], $account['amount']];
        }
        $rows[] = ['', 'Total Expenses', $data['expenses']['total']];
        $rows[] = ['', '', ''];
        
        // Net profit
        $rows[] = ['', 'NET PROFIT', $data['net_profit']];
        
        return $this->toCSV(
            $rows,
            ['Account Code', 'Account Name', 'Amount'],
            'profit-and-loss-' . $data['period']['start'] . '-to-' . $data['period']['end'] . '.csv'
        );
    }

    /**
     * Export Balance Sheet to CSV
     * 
     * @param array $data
     * @return \Illuminate\Http\Response
     */
    public function balanceSheetToCSV(array $data)
    {
        $rows = [];
        
        // Assets
        $rows[] = ['ASSETS', '', ''];
        foreach ($data['assets']['accounts'] as $account) {
            $rows[] = [$account['account_code'], $account['account_name'], $account['amount']];
        }
        $rows[] = ['', 'Total Assets', $data['assets']['total']];
        $rows[] = ['', '', ''];
        
        // Liabilities
        $rows[] = ['LIABILITIES', '', ''];
        foreach ($data['liabilities']['accounts'] as $account) {
            $rows[] = [$account['account_code'], $account['account_name'], $account['amount']];
        }
        $rows[] = ['', 'Total Liabilities', $data['liabilities']['total']];
        $rows[] = ['', '', ''];
        
        // Equity
        $rows[] = ['EQUITY', '', ''];
        foreach ($data['equity']['accounts'] as $account) {
            $rows[] = [$account['account_code'], $account['account_name'], $account['amount']];
        }
        $rows[] = ['', 'Total Equity', $data['equity']['total']];
        $rows[] = ['', '', ''];
        
        $rows[] = ['', 'TOTAL LIABILITIES & EQUITY', $data['total_liabilities_and_equity']];
        
        return $this->toCSV(
            $rows,
            ['Account Code', 'Account Name', 'Amount'],
            'balance-sheet-' . $data['as_of_date'] . '.csv'
        );
    }

    /**
     * Export Trial Balance to CSV
     * 
     * @param array $data
     * @return \Illuminate\Http\Response
     */
    public function trialBalanceToCSV(array $data)
    {
        $rows = [];
        
        foreach ($data['accounts'] as $account) {
            $rows[] = [
                $account['account_code'],
                $account['account_name'],
                $account['account_type'],
                $account['debit'],
                $account['credit'],
            ];
        }
        
        // Totals
        $rows[] = ['', '', 'TOTALS', $data['total_debit'], $data['total_credit']];
        
        return $this->toCSV(
            $rows,
            ['Account Code', 'Account Name', 'Type', 'Debit', 'Credit'],
            'trial-balance-' . $data['as_of_date'] . '.csv'
        );
    }

    /**
     * Export General Ledger to CSV
     * 
     * @param array $data
     * @return \Illuminate\Http\Response
     */
    public function generalLedgerToCSV(array $data)
    {
        $rows = [];
        
        foreach ($data['transactions'] as $transaction) {
            $rows[] = [
                $transaction['date'],
                $transaction['reference'],
                $transaction['description'],
                $transaction['debit'],
                $transaction['credit'],
                $transaction['balance'],
            ];
        }
        
        return $this->toCSV(
            $rows,
            ['Date', 'Reference', 'Description', 'Debit', 'Credit', 'Balance'],
            'general-ledger-' . ($data['account_code'] ?? 'all') . '.csv'
        );
    }

    /**
     * Export invoices to CSV
     * 
     * @param Collection $invoices
     * @return \Illuminate\Http\Response
     */
    public function invoicesToCSV(Collection $invoices)
    {
        $rows = $invoices->map(function ($invoice) {
            return [
                $invoice->reference_number,
                $invoice->customer->name ?? '',
                $invoice->date->format('Y-m-d'),
                $invoice->due_date->format('Y-m-d'),
                $invoice->subtotal,
                $invoice->tax_amount,
                $invoice->total,
                $invoice->status,
            ];
        })->toArray();
        
        return $this->toCSV(
            $rows,
            ['Invoice #', 'Customer', 'Date', 'Due Date', 'Subtotal', 'Tax', 'Total', 'Status'],
            'invoices-' . now()->format('Y-m-d') . '.csv'
        );
    }

    /**
     * Export products to CSV
     * 
     * @param Collection $products
     * @return \Illuminate\Http\Response
     */
    public function productsToCSV(Collection $products)
    {
        $rows = $products->map(function ($product) {
            return [
                $product->sku,
                $product->name,
                $product->category->name ?? '',
                $product->purchase_cost,
                $product->retail_price,
                $product->current_stock,
                $product->is_active ? 'Active' : 'Inactive',
            ];
        })->toArray();
        
        return $this->toCSV(
            $rows,
            ['SKU', 'Name', 'Category', 'Cost', 'Price', 'Stock', 'Status'],
            'products-' . now()->format('Y-m-d') . '.csv'
        );
    }

    /**
     * Export customers to CSV
     * 
     * @param Collection $customers
     * @return \Illuminate\Http\Response
     */
    public function customersToCSV(Collection $customers)
    {
        $rows = $customers->map(function ($customer) {
            return [
                $customer->code,
                $customer->name,
                $customer->email,
                $customer->phone,
                $customer->address,
                $customer->is_active ? 'Active' : 'Inactive',
            ];
        })->toArray();
        
        return $this->toCSV(
            $rows,
            ['Code', 'Name', 'Email', 'Phone', 'Address', 'Status'],
            'customers-' . now()->format('Y-m-d') . '.csv'
        );
    }
}
