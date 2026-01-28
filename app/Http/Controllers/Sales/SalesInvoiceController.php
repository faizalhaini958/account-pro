<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Invoice; // Using the generic Invoice model for Sales
use App\Models\Customer;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\InvoiceItem;
use App\Services\PostingService;
use App\Services\Posting\Rules\SalesInvoicePostingRule;
use App\Services\Posting\GLAccountResolver;
use App\Services\InventoryService;
use App\Services\SubscriptionLimitService;
use App\Services\TenantContext;

class SalesInvoiceController extends Controller
{
    protected PostingService $postingService;
    protected GLAccountResolver $glResolver;
    protected InventoryService $inventoryService;

    public function __construct(
        PostingService $postingService,
        GLAccountResolver $glResolver,
        InventoryService $inventoryService
    ) {
        $this->postingService = $postingService;
        $this->glResolver = $glResolver;
        $this->inventoryService = $inventoryService;
    }

    public function index()
    {
        $this->authorize('sales.view');

        $invoices = Invoice::with('customer')
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(10);

        $customers = Customer::where('is_active', true)->orderBy('name')->get();
        $products = Product::where('is_active', true)->orderBy('name')->get();

        $tenant = auth()->user()->currentTenant;

        return Inertia::render('Sales/Invoices/Index', [
            'invoices' => $invoices,
            'customers' => $customers,
            'products' => $products,
            'tenant' => [
                'id' => $tenant->id,
                'signature_url' => $tenant->signature_url,
                'signature_name' => $tenant->signature_name,
            ],
        ]);
    }

    public function create()
    {
        $this->authorize('sales.create');

        return Inertia::render('Sales/Invoices/Create', [
            'customers' => Customer::where('is_active', true)->orderBy('name')->get(),
            'products' => Product::where('is_active', true)->orderBy('name')->get(), // Loading all for now, optimize with search later
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('sales.create');

        // Check subscription limits
        $tenant = TenantContext::getTenant();
        $limitService = new SubscriptionLimitService();
        $owner = $limitService->getTenantOwner($tenant);

        if ($owner) {
            $limitCheck = $limitService->canCreateInvoice($tenant, $owner);
            if (!$limitCheck['allowed']) {
                return back()->withErrors(['error' => $limitCheck['message']]);
            }
        }

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:date',
            'reference_number' => 'nullable|string|max:50', // Auto-generate if empty logic to be added
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_percent' => 'nullable|numeric|min:0',
            'include_signature' => 'nullable|boolean',
            'include_qr_code' => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $subtotal = 0;
            $taxAmount = 0;

            // Calculate totals and prepare items
            foreach ($validated['items'] as $item) {
                $lineTotal = round($item['quantity'] * $item['unit_price'], 2);
                $lineTax = round($lineTotal * ($item['tax_percent'] ?? 0) / 100, 2);

                $subtotal += $lineTotal;
                $taxAmount += $lineTax;
            }

            $total = $subtotal + $taxAmount;

            $invoiceNumber = 'INV-' . date('Ymd') . '-' . str_pad((Invoice::withTrashed()->count() + 1), 4, '0', STR_PAD_LEFT);

            $invoice = Invoice::create([
                // 'tenant_id' => 1,
                'customer_id' => $validated['customer_id'],
                'number' => $invoiceNumber,
                'date' => $validated['date'],
                'due_date' => $validated['due_date'],
                'reference_number' => $validated['reference_number'] ?? null,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'outstanding_amount' => $total,
                'status' => 'draft',
                'notes' => $validated['notes'],
                'include_qr_code' => $request->boolean('include_qr_code', true),
            ]);

            foreach ($validated['items'] as $item) {
                $lineTotal = round($item['quantity'] * $item['unit_price'], 2);
                $lineTax = round($lineTotal * ($item['tax_percent'] ?? 0) / 100, 2);

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $item['product_id'] ?? null,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'tax_percent' => $item['tax_percent'] ?? 0,
                    'tax_amount' => $lineTax,
                    'total' => $lineTotal + $lineTax,
                    'track_inventory' => true, // Determine from product later
                ]);
            }

            // Handle signature if requested
            if ($request->boolean('include_signature')) {
                $tenant = auth()->user()->currentTenant;
                if ($tenant->signature_path) {
                    $signatureUrl = asset('storage/' . $tenant->signature_path);
                    $invoice->update([
                        'signature_type' => 'computer_generated',
                        'signature_data' => $signatureUrl,
                        'signature_name' => $tenant->signature_name ?? '',
                        'signed_at' => now(),
                    ]);
                }
            }
        });

        return redirect()->route('sales.invoices.index')
            ->with('success', 'Invoice created successfully.');
    }

    public function edit(Invoice $invoice)
    {
        $this->authorize('sales.edit');

        if ($invoice->status !== 'draft') {
            return redirect()->route('sales.invoices.index')
                ->with('error', 'Only draft invoices can be edited.');
        }

        return Inertia::render('Sales/Invoices/Edit', [
            'invoice' => $invoice->load('items', 'customer'),
            'customers' => Customer::where('is_active', true)->orderBy('name')->get(),
            'products' => Product::where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $this->authorize('sales.edit');

        if ($invoice->status !== 'draft') {
            return back()->with('error', 'Only draft invoices can be edited.');
        }

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:date',
            'reference_number' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_percent' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $invoice) {
            // Delete existing items
            $invoice->items()->delete();

            $subtotal = 0;
            $taxAmount = 0;

            foreach ($validated['items'] as $item) {
                $lineTotal = round($item['quantity'] * $item['unit_price'], 2);
                $lineTax = round($lineTotal * ($item['tax_percent'] ?? 0) / 100, 2);

                $subtotal += $lineTotal;
                $taxAmount += $lineTax;

                 InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $item['product_id'] ?? null,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'tax_percent' => $item['tax_percent'] ?? 0,
                    'tax_amount' => $lineTax,
                    'total' => $lineTotal + $lineTax,
                    'track_inventory' => true,
                ]);
            }

            $total = $subtotal + $taxAmount;

            $invoice->update([
                'customer_id' => $validated['customer_id'],
                'date' => $validated['date'],
                'due_date' => $validated['due_date'],
                'reference_number' => $validated['reference_number'] ?? $invoice->reference_number,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'outstanding_amount' => $total, // Reset outstanding to total since it's draft upgrade
                'notes' => $validated['notes'],
            ]);
        });

        return redirect()->route('sales.invoices.index')
            ->with('success', 'Invoice updated successfully.');
    }

    public function destroy(Invoice $invoice)
    {
        $this->authorize('sales.delete');

        if ($invoice->status !== 'draft') {
            return back()->with('error', 'Only draft invoices can be deleted.');
        }

        $invoice->delete();

        return redirect()->route('sales.invoices.index')
            ->with('success', 'Invoice deleted successfully.');
    }

    public function post(Invoice $invoice)
    {
        $this->authorize('sales.approve');

        if ($invoice->status !== 'draft') {
            return back()->with('error', 'Only draft invoices can be posted.');
        }

        DB::transaction(function () use ($invoice) {
            $invoice->update([
                'status' => 'posted',
                'posted_at' => now(),
            ]);

            // Post to GL using PostingService
            $rule = new SalesInvoicePostingRule($this->glResolver);
            $this->postingService->post($invoice, $rule);

            // Trigger Inventory Updates using InventoryService
            foreach ($invoice->items as $item) {
                if ($item->product_id) {
                    $product = Product::find($item->product_id);
                    if ($product && $product->track_inventory) {
                        $this->inventoryService->stockOut(
                            $product,
                            $item->quantity,
                            'Sales Invoice #' . $invoice->reference_number,
                            'sale'
                        );
                    }
                }
            }
        });

        return back()->with('success', 'Invoice posted successfully.');
    }

    public function void(Invoice $invoice)
    {
        $this->authorize('sales.approve');

        if ($invoice->status !== 'posted') {
            return back()->with('error', 'Only posted invoices can be voided.');
        }

        DB::transaction(function () use ($invoice) {
            $invoice->update([
                'status' => 'void',
                'outstanding_amount' => 0,
            ]);

            // Reverse GL entry using PostingService
            $journalEntry = \App\Models\JournalEntry::where('reference_type', \App\Models\Invoice::class)
                ->where('reference_id', $invoice->id)
                ->where('status', 'posted')
                ->first();

            if ($journalEntry) {
                $this->postingService->reverse($journalEntry, 'Void Invoice #' . $invoice->number);
            }

            // Reverse inventory updates using InventoryService
            foreach ($invoice->items as $item) {
                if ($item->product_id) {
                    $product = Product::find($item->product_id);
                    if ($product && $product->track_inventory) {
                        $this->inventoryService->stockIn(
                            $product,
                            $item->quantity,
                            $item->unit_price, // Use selling price as cost for reversal
                            'Void Invoice #' . $invoice->number,
                            'sale_return'
                        );
                    }
                }
            }
        });

        return back()->with('success', 'Invoice voided successfully.');
    }



    public function show(Invoice $invoice)
    {
        $this->authorize('sales.view');

        $tenant = $invoice->tenant;

        return Inertia::render('Sales/Invoices/Show', [
            'invoice' => $invoice->load(['customer', 'items']),
            'tenant' => [
                'id' => $tenant->id,
                'signature_url' => $tenant->signature_url,
                'signature_name' => $tenant->signature_name,
            ],
        ]);
    }

    public function getItems(Invoice $invoice)
    {
        $this->authorize('sales.view');
        return response()->json($invoice->load('items'));
    }

    public function pdf(Invoice $invoice)
    {
        $this->authorize('sales.view');

        $invoice->load(['customer', 'items', 'tenant']);

        // Generate QR code for the invoice
        $qrCodeService = app(\App\Services\QRCodeService::class);
        $qrCode = $qrCodeService->generateInvoiceQRCode($invoice);

        // Check for e-Invoice document
        $eInvoiceDocument = \App\Models\EInvoiceDocument::where('invoice_id', $invoice->id)
            ->latest()
            ->first();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'tenant' => $invoice->tenant,
            'qrCode' => $qrCode,
            'eInvoiceDocument' => $eInvoiceDocument,
        ]);

        return $pdf->download('invoice-' . $invoice->number . '.pdf');
    }
    public function payment(Invoice $invoice)
    {
        $this->authorize('sales.create'); // Assuming payment recording requires create permission

        if (!in_array($invoice->status, ['posted', 'partial', 'overdue'])) {
             return redirect()->route('sales.invoices.index')
                ->with('error', 'Payment can only be recorded for posted, partial, or overdue invoices.');
        }

        return Inertia::render('Sales/Invoices/Payment', [
            'invoice' => $invoice->load('customer'),
            'bankAccounts' => \App\Models\BankAccount::where('is_active', true)->orderBy('bank_name')->get(),
        ]);
    }

    /**
     * Add computer-generated signature to invoice
     */
    public function addComputerSignature(Request $request, Invoice $invoice)
    {
        $this->authorize('sales.edit');

        $tenant = $invoice->tenant;

        // Check if company has a signature
        if (!$tenant->signature_path) {
            return back()->with('error', 'No company signature found. Please upload a signature in Company Settings.');
        }

        // Use company signature
        $signatureUrl = asset('storage/' . $tenant->signature_path);

        $invoice->update([
            'signature_type' => 'computer_generated',
            'signature_data' => $signatureUrl,
            'signature_name' => $tenant->signature_name ?? '',
            'signed_at' => now(),
        ]);

        return back()->with('success', 'Signature added successfully');
    }

    /**
     * Add live signature to invoice
     */
    public function addLiveSignature(Request $request, Invoice $invoice)
    {
        $this->authorize('sales.edit');

        $request->validate([
            'signature_data' => 'required|string',
            'signature_name' => 'required|string|max:255',
        ]);

        // Remove old signature file if it was computer-generated
        if ($invoice->signature_type === 'computer_generated' && $invoice->signature_data) {
            Storage::disk('public')->delete($invoice->signature_data);
        }

        $invoice->update([
            'signature_type' => 'live',
            'signature_data' => $request->signature_data,
            'signature_name' => $request->signature_name,
            'signed_at' => now(),
        ]);

        return back()->with('success', 'Document signed successfully');
    }

    /**
     * Remove signature from invoice
     */
    public function removeSignature(Invoice $invoice)
    {
        $this->authorize('sales.edit');

        // Delete file if computer-generated
        if ($invoice->signature_type === 'computer_generated' && $invoice->signature_data) {
            Storage::disk('public')->delete($invoice->signature_data);
        }

        $invoice->update([
            'signature_type' => 'none',
            'signature_data' => null,
            'signature_name' => null,
            'signed_at' => null,
        ]);

        return back()->with('success', 'Signature removed successfully');
    }
}
