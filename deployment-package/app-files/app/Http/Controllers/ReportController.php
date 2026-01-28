<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use App\Services\PDFService;
use App\Services\ExportService;
use App\Exports\TrialBalanceExport;
use App\Exports\GeneralLedgerExport;
use App\Exports\ARAgingExport;
use App\Exports\APAgingExport;
use App\Exports\SalesInvoiceExport;
use App\Exports\PurchaseInvoiceExport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    protected ReportService $reportService;
    protected PDFService $pdfService;
    protected ExportService $exportService;

    public function __construct(
        ReportService $reportService,
        PDFService $pdfService,
        ExportService $exportService
    ) {
        $this->reportService = $reportService;
        $this->pdfService = $pdfService;
        $this->exportService = $exportService;
    }

    /**
     * Profit & Loss Report
     */
    public function profitAndLoss(Request $request)
    {
        $this->authorize('reports.view');

        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))
            : now()->startOfMonth();

        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))
            : now()->endOfMonth();

        $report = $this->reportService->profitAndLoss($startDate, $endDate);

        // Handle export formats
        if ($request->input('format') === 'pdf') {
            $pdf = $this->pdfService->generateProfitAndLoss($report);
            return $pdf->download('profit-and-loss.pdf');
        }

        if ($request->input('format') === 'csv') {
            return $this->exportService->profitAndLossToCSV($report);
        }

        return Inertia::render('Reports/ProfitAndLoss', [
            'report' => $report,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Balance Sheet Report
     */
    public function balanceSheet(Request $request)
    {
        $this->authorize('reports.view');

        $asOfDate = $request->input('as_of_date')
            ? Carbon::parse($request->input('as_of_date'))
            : now();

        $report = $this->reportService->balanceSheet($asOfDate);

        // Handle export formats
        if ($request->input('format') === 'pdf') {
            $pdf = $this->pdfService->generateBalanceSheet($report);
            return $pdf->download('balance-sheet.pdf');
        }

        if ($request->input('format') === 'csv') {
            return $this->exportService->balanceSheetToCSV($report);
        }

        return Inertia::render('Reports/BalanceSheet', [
            'report' => $report,
            'filters' => [
                'as_of_date' => $asOfDate->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Trial Balance Report
     */
    public function trialBalance(Request $request)
    {
        $this->authorize('reports.view');

        $asOfDate = $request->input('as_of_date')
            ? Carbon::parse($request->input('as_of_date'))
            : now();

        $report = $this->reportService->trialBalance($asOfDate);

        // Handle export formats
        if ($request->input('format') === 'pdf') {
            $pdf = $this->pdfService->generateTrialBalance($report);
            return $pdf->download('trial-balance.pdf');
        }

        if ($request->input('format') === 'csv') {
            return $this->exportService->trialBalanceToCSV($report);
        }

        if ($request->input('format') === 'excel') {
            $this->authorize('reports.export');
            $tenantName = auth()->user()->currentTenant?->name;
            return Excel::download(
                new TrialBalanceExport([], $tenantName, $asOfDate->format('Y-m-d')),
                'trial-balance-' . now()->format('Y-m-d') . '.xlsx'
            );
        }

        return Inertia::render('Reports/TrialBalance', [
            'report' => $report,
            'filters' => [
                'as_of_date' => $asOfDate->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * AR Aging Report
     */
    public function arAging(Request $request)
    {
        $this->authorize('reports.view');

        $report = $this->reportService->arAging();

        // Handle export formats
        if ($request->input('format') === 'pdf') {
            $pdf = $this->pdfService->generateARAging($report);
            return $pdf->download('ar-aging.pdf');
        }

        if ($request->input('format') === 'csv') {
            // Create CSV export for AR Aging
            $rows = [];
            foreach ($report['aging'] as $category => $invoices) {
                foreach ($invoices as $invoice) {
                    $rows[] = [
                        $invoice['invoice_number'],
                        $invoice['customer'],
                        $invoice['date'],
                        $invoice['due_date'],
                        $invoice['amount'],
                        $invoice['days_overdue'],
                        ucfirst(str_replace('_', '-', $category)),
                    ];
                }
            }

            return $this->exportService->toCSV(
                $rows,
                ['Invoice #', 'Customer', 'Date', 'Due Date', 'Amount', 'Days Overdue', 'Category'],
                'ar-aging-' . now()->format('Y-m-d') . '.csv'
            );
        }

        if ($request->input('format') === 'excel') {
            $this->authorize('reports.export');
            $tenantName = auth()->user()->currentTenant?->name;
            return Excel::download(
                new ARAgingExport([], $tenantName),
                'ar-aging-' . now()->format('Y-m-d') . '.xlsx'
            );
        }

        return Inertia::render('Reports/ARAging', [
            'report' => $report,
        ]);
    }

    /**
     * AP Aging Report
     */
    public function apAging(Request $request)
    {
        $this->authorize('reports.view');

        $report = $this->reportService->apAging();

        // Handle export formats
        if ($request->input('format') === 'pdf') {
            // Similar to AR Aging PDF
            $pdf = $this->pdfService->generateCustomReport('pdf.ap-aging', ['report' => $report]);
            return $pdf->download('ap-aging.pdf');
        }

        if ($request->input('format') === 'csv') {
            $rows = [];
            foreach ($report['aging'] as $category => $invoices) {
                foreach ($invoices as $invoice) {
                    $rows[] = [
                        $invoice['invoice_number'],
                        $invoice['supplier'],
                        $invoice['date'],
                        $invoice['due_date'],
                        $invoice['amount'],
                        $invoice['days_overdue'],
                        ucfirst(str_replace('_', '-', $category)),
                    ];
                }
            }

            return $this->exportService->toCSV(
                $rows,
                ['Invoice #', 'Supplier', 'Date', 'Due Date', 'Amount', 'Days Overdue', 'Category'],
                'ap-aging-' . now()->format('Y-m-d') . '.csv'
            );
        }

        if ($request->input('format') === 'excel') {
            $this->authorize('reports.export');
            $tenantName = auth()->user()->currentTenant?->name;
            return Excel::download(
                new APAgingExport([], $tenantName),
                'ap-aging-' . now()->format('Y-m-d') . '.xlsx'
            );
        }

        return Inertia::render('Reports/APAging', [
            'report' => $report,
        ]);
    }

    /**
     * Inventory Valuation Report
     */
    public function inventoryValuation(Request $request)
    {
        $this->authorize('reports.view');

        $report = $this->reportService->inventoryValuation();

        // Handle export formats
        if ($request->input('format') === 'csv') {
            return $this->exportService->toCSV(
                $report['products'],
                ['Product ID', 'Product Name', 'SKU', 'Quantity', 'Average Cost', 'Total Value'],
                'inventory-valuation-' . now()->format('Y-m-d') . '.csv'
            );
        }

        return Inertia::render('Reports/InventoryValuation', [
            'report' => $report,
        ]);
    }

    /**
     * SST Summary Report
     */
    public function sstSummary(Request $request)
    {
        $this->authorize('reports.view');

        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))
            : now()->startOfMonth();

        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))
            : now()->endOfMonth();

        $sstService = app(\App\Services\SSTReportService::class);
        $report = $sstService->getSSTSummary($startDate, $endDate);

        // Handle export formats
        if ($request->input('format') === 'csv') {
            $rows = [
                ['SST SUMMARY REPORT'],
                ['Period', $report['period']['start'] . ' to ' . $report['period']['end']],
                [''],
                ['SALES (OUTPUT TAX)'],
                ['Total Sales', $report['sales']['total_sales']],
                ['Total SST Collected', $report['sales']['total_sst']],
                ['Transactions', $report['sales']['transaction_count']],
                [''],
                ['PURCHASES (INPUT TAX)'],
                ['Total Purchases', $report['purchases']['total_purchases']],
                ['Total SST Paid', $report['purchases']['total_sst']],
                ['Transactions', $report['purchases']['transaction_count']],
                [''],
                ['SUMMARY'],
                ['Output Tax', $report['summary']['output_tax']],
                ['Input Tax', $report['summary']['input_tax']],
                ['Net SST Payable', $report['summary']['net_sst_payable']],
            ];

            return $this->exportService->toCSV(
                $rows,
                ['Description', 'Amount'],
                'sst-summary-' . now()->format('Y-m-d') . '.csv'
            );
        }

        return Inertia::render('Reports/SSTSummary', [
            'report' => $report,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Audit Trail Report
     */
    public function auditTrail(Request $request)
    {
        $this->authorize('reports.view');

        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))
            : now()->startOfMonth();

        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))
            : now()->endOfMonth();

        $type = $request->input('type');

        $auditService = app(\App\Services\AuditTrailService::class);
        $report = $auditService->getAuditTrail($startDate, $endDate, $type);

        // Handle export formats
        if ($request->input('format') === 'csv') {
            return $this->exportService->toCSV(
                $report['activities'],
                ['Type', 'Reference', 'Description', 'User', 'Date', 'Amount', 'Status'],
                'audit-trail-' . now()->format('Y-m-d') . '.csv'
            );
        }

        return Inertia::render('Reports/AuditTrail', [
            'report' => $report,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'type' => $type,
            ],
        ]);
    }

    /**
     * Reports Index/Dashboard
     */
    public function index()
    {
        $this->authorize('reports.view');

        return Inertia::render('Reports/Index');
    }
}
