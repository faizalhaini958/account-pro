<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Quotation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class QuotationController extends Controller
{
    public function index()
    {
        $this->authorize('sales.view');

        $quotations = Quotation::with(['customer', 'items'])
            ->latest()
            ->paginate(10);

        $customers = \App\Models\Customer::orderBy('name')->select('id', 'name', 'company_name', 'email')->get();
        $products = \App\Models\Product::where('is_active', true)->orderBy('name')->select('id', 'name', 'sku', 'retail_price', 'unit_id')->get();

        $tenant = auth()->user()->currentTenant;

        return Inertia::render('Sales/Quotations/Index', [
            'quotations' => $quotations,
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

        $customers = \App\Models\Customer::orderBy('name')->select('id', 'name', 'company_name', 'email')->get();
        $products = \App\Models\Product::where('is_active', true)->orderBy('name')->select('id', 'name', 'sku', 'retail_price', 'unit_id')->get();

        return Inertia::render('Sales/Quotations/Create', [
            'customers' => $customers,
            'products' => $products,
        ]);
    }

    public function store(Request $request, \App\Services\NumberingService $numberingService)
    {
        $this->authorize('sales.create');

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'date' => 'required|date',
            'valid_until' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.product_id' => 'nullable|exists:products,id',
            'notes' => 'nullable|string',
            'terms' => 'nullable|string',
            'include_signature' => 'nullable|boolean',
        ]);

        return \DB::transaction(function () use ($validated, $numberingService, $request) {
            // Generate number
            $prefix = 'QT-' . date('Y') . '-';
            $number = $numberingService->generate('quotation', $prefix, 4);

            // Calculate totals
            $subtotal = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $lineTotal = $item['quantity'] * $item['unit_price'];
                $subtotal += $lineTotal;

                $itemsData[] = array_merge($item, [
                    'total' => $lineTotal,
                    // Default values for now
                    'discount_amount' => 0,
                    'tax_percent' => 0,
                    'tax_amount' => 0,
                ]);
            }

            $quotation = \App\Models\Quotation::create([
                // 'tenant_id' => 1, // Handled automatically by TenantScoped trait
                'customer_id' => $validated['customer_id'],
                'number' => $number,
                'date' => $validated['date'],
                'valid_until' => $validated['valid_until'],
                'notes' => $validated['notes'],
                'terms' => $validated['terms'],
                'subtotal' => $subtotal,
                'total' => $subtotal, // Tax not implemented yet
                'status' => 'draft',
            ]);

            // Handle signature if requested
            if ($request->boolean('include_signature')) {
                $tenant = auth()->user()->currentTenant;
                if ($tenant->signature_path) {
                    $signatureUrl = asset('storage/' . $tenant->signature_path);
                    $quotation->update([
                        'signature_type' => 'computer_generated',
                        'signature_data' => $signatureUrl,
                        'signature_name' => $tenant->signature_name ?? '',
                        'signed_at' => now(),
                    ]);
                }
            }

            $quotation->items()->createMany($itemsData);

            return redirect()->route('sales.quotations.index')
                ->with('success', 'Quotation created successfully.');
        });
    }

    public function show(Quotation $quotation)
    {
        $this->authorize('sales.view');

        $tenant = $quotation->tenant;

        return Inertia::render('Sales/Quotations/Show', [
            'quotation' => $quotation->load(['customer', 'items']),
            'tenant' => [
                'id' => $tenant->id,
                'signature_url' => $tenant->signature_url,
                'signature_name' => $tenant->signature_name,
            ],
        ]);
    }

    public function pdf(Quotation $quotation)
    {
        $this->authorize('sales.view');

        $quotation->load(['customer', 'items', 'tenant']);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.quotation', [
            'quotation' => $quotation,
            'tenant' => $quotation->tenant,
        ]);

        return $pdf->download('quotation-' . $quotation->number . '.pdf');
    }

    public function edit(Quotation $quotation)
    {
        $this->authorize('sales.edit');

        $quotation->load('items');

        $customers = \App\Models\Customer::orderBy('name')->select('id', 'name', 'company_name', 'email')->get();
        $products = \App\Models\Product::where('is_active', true)->orderBy('name')->select('id', 'name', 'sku', 'retail_price', 'unit_id')->get();

        return Inertia::render('Sales/Quotations/Edit', [
            'quotation' => $quotation,
            'customers' => $customers,
            'products' => $products,
        ]);
    }

    public function update(Request $request, Quotation $quotation)
    {
        $this->authorize('sales.edit');

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'date' => 'required|date',
            'valid_until' => 'nullable|date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.product_id' => 'nullable|exists:products,id',
            'notes' => 'nullable|string',
            'terms' => 'nullable|string',
        ]);

        return \DB::transaction(function () use ($validated, $quotation) {
            // Calculate totals
            $subtotal = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $lineTotal = $item['quantity'] * $item['unit_price'];
                $subtotal += $lineTotal;

                $itemsData[] = array_merge($item, [
                    'total' => $lineTotal,
                    // Default values for now, preserving existing logic
                    'discount_amount' => 0,
                    'tax_percent' => 0,
                    'tax_amount' => 0,
                ]);
            }

            $quotation->update([
                'customer_id' => $validated['customer_id'],
                'date' => $validated['date'],
                'valid_until' => $validated['valid_until'],
                'notes' => $validated['notes'],
                'terms' => $validated['terms'],
                'subtotal' => $subtotal,
                'total' => $subtotal,
            ]);

            // Sync items: simple delete and recreate strategy for now
            $quotation->items()->delete();
            $quotation->items()->createMany($itemsData);

            return redirect()->route('sales.quotations.index')
                ->with('success', 'Quotation updated successfully.');
        });
    }

    public function destroy(Quotation $quotation)
    {
        $this->authorize('sales.delete');

        if ($quotation->status !== 'draft') {
            return back()->with('error', 'Only draft quotations can be deleted.');
        }

        $quotation->items()->delete();
        $quotation->delete();

        return redirect()->route('sales.quotations.index')
            ->with('success', 'Quotation deleted successfully.');
    }

    public function markAsSent(Quotation $quotation)
    {
        $this->authorize('sales.edit');

        if ($quotation->status !== 'draft') {
            return back()->with('error', 'Only draft quotations can be marked as sent.');
        }

        $quotation->update(['status' => 'sent']);

        return back()->with('success', 'Quotation marked as sent.');
    }

    public function markAsAccepted(Quotation $quotation)
    {
        $this->authorize('sales.approve');

        if (!in_array($quotation->status, ['sent', 'draft'])) {
            return back()->with('error', 'Only sent or draft quotations can be marked as accepted.');
        }

        $quotation->update(['status' => 'accepted']);

        return back()->with('success', 'Quotation marked as accepted.');
    }

    public function markAsRejected(Quotation $quotation)
    {
        $this->authorize('sales.approve');

        if (!in_array($quotation->status, ['sent', 'accepted'])) {
            return back()->with('error', 'Only sent or accepted quotations can be marked as rejected.');
        }

        $quotation->update(['status' => 'rejected']);

        return back()->with('success', 'Quotation marked as rejected.');
    }

    public function convertToInvoice(Quotation $quotation)
    {
        $this->authorize('sales.create');

        if ($quotation->status !== 'accepted') {
            return back()->with('error', 'Only accepted quotations can be converted to invoice.');
        }

        return \DB::transaction(function () use ($quotation) {
            // Generate Invoice Number
            $count = \App\Models\Invoice::count() + 1;
            $invoiceNumber = 'INV-' . date('Y') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

            // Create Invoice
            $invoice = \App\Models\Invoice::create([
                'tenant_id' => $quotation->tenant_id,
                'customer_id' => $quotation->customer_id,
                'number' => $invoiceNumber,
                'date' => now(), // Invoice date is today
                'due_date' => now()->addDays(30), // Default due date
                'subtotal' => $quotation->subtotal,
                'total' => $quotation->total,
                'status' => 'draft', // Initial invoice status
                'notes' => $quotation->notes,
                'terms' => $quotation->terms,
                // Inherit other fields if necessary
            ]);

            // Create Invoice Items from Quotation Items
            $quotation->load('items');
            $invoiceItems = [];

            foreach ($quotation->items as $item) {
                $invoiceItems[] = [
                    'product_id' => $item->product_id,
                    'description' => $item->description,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'unit_cost' => 0, // Need to implement cost tracking later
                    'discount_amount' => $item->discount_amount,
                    'tax_percent' => $item->tax_percent,
                    'tax_amount' => $item->tax_amount,
                    'total' => $item->total,
                ];
            }

            $invoice->items()->createMany($invoiceItems);

            // Update Quotation Status
            $quotation->update([
                'status' => 'converted',
                'converted_to_invoice_id' => $invoice->id,
            ]);

            return redirect()->route('sales.invoices.index') // Redirect to invoices index (or edit page if available)
                ->with('success', 'Quotation converted to Invoice ' . $invoiceNumber);
        });
    }

    /**
     * Add computer-generated signature to quotation
     */
    public function addComputerSignature(Request $request, Quotation $quotation)
    {
        $this->authorize('sales.edit');

        $tenant = $quotation->tenant;

        // Check if company has a signature
        if (!$tenant->signature_path) {
            return back()->with('error', 'No company signature found. Please upload a signature in Company Settings.');
        }

        // Use company signature
        $signatureUrl = asset('storage/' . $tenant->signature_path);

        $quotation->update([
            'signature_type' => 'computer_generated',
            'signature_data' => $signatureUrl,
            'signature_name' => $tenant->signature_name ?? '',
            'signed_at' => now(),
        ]);

        return back()->with('success', 'Signature added successfully');
    }

    /**
     * Add live signature to quotation
     */
    public function addLiveSignature(Request $request, Quotation $quotation)
    {
        $this->authorize('sales.edit');

        $request->validate([
            'signature_data' => 'required|string',
            'signature_name' => 'required|string|max:255',
        ]);

        // Remove old signature file if it was computer-generated
        if ($quotation->signature_type === 'computer_generated' && $quotation->signature_data) {
            Storage::disk('public')->delete($quotation->signature_data);
        }

        $quotation->update([
            'signature_type' => 'live',
            'signature_data' => $request->signature_data,
            'signature_name' => $request->signature_name,
            'signed_at' => now(),
        ]);

        return back()->with('success', 'Document signed successfully');
    }

    /**
     * Remove signature from quotation
     */
    public function removeSignature(Quotation $quotation)
    {
        $this->authorize('sales.edit');

        // Delete file if computer-generated
        if ($quotation->signature_type === 'computer_generated' && $quotation->signature_data) {
            Storage::disk('public')->delete($quotation->signature_data);
        }

        $quotation->update([
            'signature_type' => 'none',
            'signature_data' => null,
            'signature_name' => null,
            'signed_at' => null,
        ]);

        return back()->with('success', 'Signature removed successfully');
    }
}
