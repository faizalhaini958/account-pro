<?php

namespace App\Http\Controllers\Reporting;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('Reporting/Index');
    }

    public function sales(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        $invoices = Invoice::with('customer')
            ->whereBetween('date', [$startDate, $endDate])
            ->where('status', '!=', 'void')
            ->orderBy('date')
            ->get();

        // Chart Data: Sales per Day
        $chartData = Invoice::selectRaw('DATE(date) as date, SUM(total) as total')
            ->whereBetween('date', [$startDate, $endDate])
            ->where('status', '!=', 'void')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $summary = [
            'total_sales' => $invoices->sum('total'),
            'total_tax' => $invoices->sum('tax_amount'),
            'total_paid' => $invoices->sum('paid_amount'),
            'total_outstanding' => $invoices->sum('outstanding_amount'),
            'invoice_count' => $invoices->count(),
        ];

        return Inertia::render('Reporting/Sales/Index', [
            'invoices' => $invoices,
            'summary' => $summary,
            'chartData' => $chartData,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    public function stock(Request $request)
    {
        $products = Product::where('track_inventory', true)
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'code' => $product->sku ?? 'N/A', // Assuming SKU exists or uses Code
                    'name' => $product->name,
                    'current_stock' => $product->current_stock,
                    'purchase_cost' => $product->purchase_cost,
                    'retail_price' => $product->retail_price,
                    'stock_value' => $product->current_stock * $product->purchase_cost,
                    'potential_revenue' => $product->current_stock * $product->retail_price,
                ];
            });

        $summary = [
            'total_items' => $products->sum('current_stock'),
            'total_value' => $products->sum('stock_value'),
            'total_potential_revenue' => $products->sum('potential_revenue'),
            'low_stock_count' => $products->where('current_stock', '<=', 10)->count(), // Example threshold
        ];

        return Inertia::render('Reporting/Stock/Index', [
            'products' => $products,
            'summary' => $summary,
        ]);
    }
}
