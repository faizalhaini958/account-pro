<?php

namespace App\Http\Controllers;

use App\Models\EInvoiceDocument;
use App\Models\Invoice;
use App\Services\EInvoiceService;
use App\Services\MyInvoisGatewayService;
use App\Jobs\SubmitEInvoiceJob;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\TenantContext;

class EInvoiceController extends Controller
{
    protected EInvoiceService $einvoiceService;
    protected MyInvoisGatewayService $gateway;

    public function __construct(EInvoiceService $einvoiceService, MyInvoisGatewayService $gateway)
    {
        $this->einvoiceService = $einvoiceService;
        $this->gateway = $gateway;
    }

    /**
     * e-Invoice Center Dashboard
     */
    public function index(Request $request)
    {
        $query = EInvoiceDocument::with(['invoice.customer'])
            ->latest();

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereHas('invoice', function ($q) use ($request) {
                $q->whereDate('date', '>=', $request->start_date);
            });
        }

        if ($request->filled('end_date')) {
            $query->whereHas('invoice', function ($q) use ($request) {
                $q->whereDate('date', '<=', $request->end_date);
            });
        }

        $documents = $query->paginate(20);

        // Statistics
        $stats = [
            'total' => EInvoiceDocument::count(),
            'prepared' => EInvoiceDocument::where('status', 'prepared')->count(),
            'submitted' => EInvoiceDocument::where('status', 'submitted')->count(),
            'validated' => EInvoiceDocument::where('status', 'validated')->count(),
            'rejected' => EInvoiceDocument::where('status', 'rejected')->count(),
        ];

        return Inertia::render('EInvoice/Index', [
            'documents' => $documents,
            'stats' => $stats,
            'filters' => $request->only(['status', 'start_date', 'end_date']),
            'isConfigured' => $this->gateway->isConfigured(),
        ]);
    }

    /**
     * Prepare e-Invoice from invoice
     */
    public function prepare(Invoice $invoice)
    {
        $document = $this->einvoiceService->prepareEInvoice($invoice);

        return redirect()->back()->with('success', 'e-Invoice prepared successfully');
    }

    /**
     * Submit e-Invoice to MyInvois
     */
    public function submit(EInvoiceDocument $document)
    {
        if ($document->status !== 'prepared') {
            return redirect()->back()->with('error', 'Only prepared documents can be submitted');
        }

        // Dispatch job for async submission
        SubmitEInvoiceJob::dispatch($document);

        return redirect()->back()->with('success', 'e-Invoice submission queued');
    }

    /**
     * Batch submit multiple documents
     */
    public function batchSubmit(Request $request)
    {
        $request->validate([
            'document_ids' => 'required|array',
            'document_ids.*' => 'exists:einvoice_documents,id',
        ]);

        $documents = EInvoiceDocument::whereIn('id', $request->document_ids)
            ->where('status', 'prepared')
            ->get();

        foreach ($documents as $document) {
            SubmitEInvoiceJob::dispatch($document);
        }

        return redirect()->back()->with('success', count($documents) . ' documents queued for submission');
    }

    /**
     * Check submission status
     */
    public function checkStatus(EInvoiceDocument $document)
    {
        if (!$document->uuid) {
            return redirect()->back()->with('error', 'Document has not been submitted yet');
        }

        $result = $this->gateway->checkStatus($document->uuid);

        return redirect()->back()->with('success', 'Status: ' . ($result['status'] ?? 'unknown'));
    }

    /**
     * Cancel e-Invoice
     */
    public function cancel(EInvoiceDocument $document, Request $request)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if (!$document->uuid) {
            return redirect()->back()->with('error', 'Document has not been submitted yet');
        }

        $result = $this->gateway->cancelDocument($document->uuid, $request->reason);

        if ($result['success']) {
            return redirect()->back()->with('success', 'e-Invoice cancelled successfully');
        }

        return redirect()->back()->with('error', $result['message'] ?? 'Failed to cancel document');
    }

    /**
     * View e-Invoice details
     */
    public function show(EInvoiceDocument $document)
    {
        $document->load(['invoice.customer', 'invoice.items']);

        return Inertia::render('EInvoice/Show', [
            'document' => $document,
        ]);
    }

    /**
     * Settings page
     */
    public function settings()
    {
        $tenant = TenantContext::getTenant();

        return Inertia::render('EInvoice/Settings', [
            'settings' => [
                'einvoice_enabled' => $tenant->einvoice_enabled,
                'tin' => $tenant->tin,
                'brn' => $tenant->brn,
                'sst_registration_number' => $tenant->sst_registration_number,
                'is_sst_registered' => $tenant->is_sst_registered,
                'myinvois_sandbox_mode' => $tenant->myinvois_sandbox_mode,
                'einvoice_classification' => $tenant->einvoice_classification,
                'myinvois_client_id' => $tenant->myinvois_client_id ? '********' : '',
                'myinvois_client_secret' => $tenant->myinvois_client_secret ? '********' : '',
            ],
        ]);
    }

    /**
     * Update settings
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'einvoice_enabled' => 'boolean',
            'tin' => 'nullable|string|max:50',
            'brn' => 'nullable|string|max:50',
            'sst_registration_number' => 'nullable|string|max:50',
            'is_sst_registered' => 'boolean',
            'myinvois_client_id' => 'nullable|string',
            'myinvois_client_secret' => 'nullable|string',
            'myinvois_sandbox_mode' => 'boolean',
            'einvoice_classification' => 'nullable|string|max:10',
        ]);

        // Remove masked fields if they haven't changed
        if (isset($validated['myinvois_client_id']) && $validated['myinvois_client_id'] === '********') {
            unset($validated['myinvois_client_id']);
        }

        if (isset($validated['myinvois_client_secret']) && $validated['myinvois_client_secret'] === '********') {
            unset($validated['myinvois_client_secret']);
        }

        $tenant = TenantContext::getTenant();
        $tenant->update($validated);

        return redirect()->route('einvoice.index')->with('success', 'e-Invoice settings updated successfully');
    }
}
