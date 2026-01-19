<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Product;
use App\Models\PurchaseInvoice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        // 1. Sales Today
        $salesToday = Invoice::whereDate('date', $today)
            ->where('status', '!=', 'void')
            ->sum('total');

        // 2. Receivables (Outstanding Sales Invoices)
        $receivables = Invoice::where('outstanding_amount', '>', 0)
            ->where('status', '!=', 'void')
            ->sum('outstanding_amount');

        // 3. Payables (Outstanding Purchase Invoices)
        $payables = PurchaseInvoice::where('outstanding_amount', '>', 0)
            ->where('status', '!=', 'void')
            ->sum('outstanding_amount');

        // 4. Low Stock Items
        // Assuming reorder_level is nullable, default to 10 if null
        $lowStock = Product::where('track_inventory', true)
            ->where('is_active', true)
            ->whereRaw('current_stock <= COALESCE(reorder_level, 10)')
            ->count();

        // 5. Sales Trend (Last 7 Days)
        $chartData = Invoice::selectRaw('DATE(date) as date, SUM(total) as total')
            ->where('date', '>=', Carbon::now()->subDays(6))
            ->where('status', '!=', 'void')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => Carbon::parse($item->date)->format('D, d M'),
                    'total' => (float) $item->total,
                ];
            });

        // 6. Recent Invoices
        $recentInvoices = Invoice::with('customer')
            ->where('status', '!=', 'void')
            ->latest('created_at')
            ->take(5)
            ->get();

        return Inertia::render('Dashboard', [
            'metrics' => [
                'sales_today' => $salesToday,
                'receivables' => $receivables,
                'payables' => $payables,
                'low_stock' => $lowStock,
            ],
            'chartData' => $chartData,
            'recentInvoices' => $recentInvoices,
        ]);
    }
}
