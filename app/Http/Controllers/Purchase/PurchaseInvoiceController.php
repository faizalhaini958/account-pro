<?php

namespace App\Http\Controllers\Purchase;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\PurchaseInvoice;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Services\InventoryService;

class PurchaseInvoiceController extends Controller
{
    protected InventoryService $inventoryService;
    protected \App\Services\NumberingService $numberingService;

    public function __construct(InventoryService $inventoryService, \App\Services\NumberingService $numberingService)
    {
        $this->inventoryService = $inventoryService;
        $this->numberingService = $numberingService;
    }
    public function index()
    {
        $this->authorize('purchases.view');

        $invoices = PurchaseInvoice::with('supplier')
            ->orderByDesc('date')
            ->paginate(10);

        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();
        $products = Product::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Purchase/Invoices/Index', [
            'invoices' => $invoices,
            'suppliers' => $suppliers,
            'products' => $products,
        ]);
    }

    public function create()
    {
        $this->authorize('purchases.create');

        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();
        $products = Product::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Purchase/Invoices/Create', [
            'suppliers' => $suppliers,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('purchases.create');

        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:date',
            'reference_number' => 'required|string|max:50',
            'notes' => 'nullable|string',
            'terms' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_percent' => 'nullable|numeric|min:0',
            'items.*.track_inventory' => 'boolean',
        ]);

        DB::transaction(function () use ($validated) {
            $subtotal = 0;
            $taxAmount = 0;
            $total = 0;

            // Calculate totals from items to be safe
            $itemsData = [];
            foreach ($validated['items'] as $item) {
                $lineTotal = round($item['quantity'] * $item['unit_price'], 2);
                $lineTax = 0;
                if (!empty($item['tax_percent'])) {
                    $lineTax = round($lineTotal * ($item['tax_percent'] / 100), 2);
                }
                $lineGrandTotal = $lineTotal + $lineTax;

                $subtotal += $lineTotal;
                $taxAmount += $lineTax;
                $total += $lineGrandTotal;

                $itemsData[] = array_merge($item, [
                    'total' => $lineGrandTotal,
                    'tax_amount' => $lineTax,
                    'unit' => 'unit', // Helper or default
                ]);
            }

            $invoice = PurchaseInvoice::create([
                // 'tenant_id' => 1,
                'supplier_id' => $validated['supplier_id'],
                'date' => $validated['date'],
                'due_date' => $validated['due_date'],
                'number' => $this->numberingService->generate('purchase_invoice', 'BILL-'),
                'supplier_invoice_number' => $validated['reference_number'],
                'notes' => $validated['notes'] ?? null,
                'terms' => $validated['terms'] ?? null,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'outstanding_amount' => $total, // Initially unpaid
                'status' => 'draft',
            ]);

            $invoice->items()->createMany($itemsData);
        });

        return redirect()->route('purchase.invoices.index')
            ->with('success', 'Purchase Invoice created successfully.');
    }

    public function edit(PurchaseInvoice $purchaseInvoice)
    {
        $this->authorize('purchases.edit');

        // Must use load with callback or string
        $purchaseInvoice->load(['items', 'supplier']);

        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();
        $products = Product::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Purchase/Invoices/Edit', [
            'invoice' => $purchaseInvoice,
            'suppliers' => $suppliers,
            'products' => $products,
        ]);
    }

    public function update(Request $request, PurchaseInvoice $purchaseInvoice)
    {
        $this->authorize('purchases.edit');

        if ($purchaseInvoice->status !== 'draft') {
            return redirect()->back()->with('error', 'Only draft invoices can be edited.');
        }

        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:date',
            'reference_number' => 'required|string|max:50',
            'notes' => 'nullable|string',
            'terms' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_percent' => 'nullable|numeric|min:0',
            'items.*.track_inventory' => 'boolean',
        ]);

        DB::transaction(function () use ($validated, $purchaseInvoice) {
            $subtotal = 0;
            $taxAmount = 0;
            $total = 0;

            // Delete old items
            $purchaseInvoice->items()->delete();

            // Calculate totals from items to be safe
            $itemsData = [];
            foreach ($validated['items'] as $item) {
                $lineTotal = round($item['quantity'] * $item['unit_price'], 2);
                $lineTax = 0;
                if (!empty($item['tax_percent'])) {
                    $lineTax = round($lineTotal * ($item['tax_percent'] / 100), 2);
                }
                $lineGrandTotal = $lineTotal + $lineTax;

                $subtotal += $lineTotal;
                $taxAmount += $lineTax;
                $total += $lineGrandTotal;

                $itemsData[] = array_merge($item, [
                    'total' => $lineGrandTotal,
                    'tax_amount' => $lineTax,
                    'unit' => 'unit',
                ]);
            }

            $purchaseInvoice->update([
                'supplier_id' => $validated['supplier_id'],
                'date' => $validated['date'],
                'due_date' => $validated['due_date'],
                'supplier_invoice_number' => $validated['reference_number'],
                'notes' => $validated['notes'],
                'terms' => $validated['terms'],
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'outstanding_amount' => $total - $purchaseInvoice->paid_amount, // Re-calculate outstanding
            ]);

            $purchaseInvoice->items()->createMany($itemsData);
        });

        return redirect()->route('purchase.invoices.index')
            ->with('success', 'Purchase Invoice updated successfully.');
    }

    public function destroy(PurchaseInvoice $purchaseInvoice)
    {
        $this->authorize('purchases.delete');

        if ($purchaseInvoice->status !== 'draft') {
            return redirect()->back()->with('error', 'Only draft invoices can be deleted.');
        }

        $purchaseInvoice->delete();

        return redirect()->route('purchase.invoices.index')
            ->with('success', 'Purchase Invoice deleted successfully.');
    }

    public function markAsPosted(PurchaseInvoice $purchaseInvoice)
    {
        $this->authorize('purchases.approve');

         if ($purchaseInvoice->status !== 'draft') {
            return redirect()->back()->with('error', 'Invoice is not in draft status.');
        }

        $purchaseInvoice->update([
            'status' => 'posted',
            'posted_at' => now(),
        ]);

        // TODO: Trigger GL Posting
        DB::transaction(function () use ($purchaseInvoice) {
            $purchaseInvoice->update([
                'status' => 'posted',
                'posted_at' => now(),
            ]);

            // Trigger Inventory Updates using InventoryService (Increase stock)
            foreach ($purchaseInvoice->items as $item) {
                if ($item->product_id) {
                    $product = \App\Models\Product::find($item->product_id);
                    if ($product && $product->track_inventory) {
                        $this->inventoryService->stockIn(
                            $product,
                            $item->quantity,
                            $item->unit_price,
                            'Purchase Invoice #' . $purchaseInvoice->invoice_number,
                            'purchase'
                        );
                    }
                }
            }
        });

        return redirect()->back()->with('success', 'Purchase Invoice posted successfully.');
    }

     public function markAsVoid(PurchaseInvoice $purchaseInvoice)
    {
        $this->authorize('purchases.approve');

        if ($purchaseInvoice->status === 'paid' || $purchaseInvoice->paid_amount > 0) {
             return redirect()->back()->with('error', 'Cannot void an invoice that has payments.');
        }

        $purchaseInvoice->update([
            'status' => 'void',
            'outstanding_amount' => 0,
        ]);

        // TODO: Reverse GL Posting
        // TODO: Reverse Inventory Updates
        DB::transaction(function () use ($purchaseInvoice) {
            $purchaseInvoice->update([
                'status' => 'void',
                'outstanding_amount' => 0,
            ]);

            // Reverse Inventory Updates (Decrease stock)
            foreach ($purchaseInvoice->items as $item) {
                if ($item->product_id) {
                    $product = \App\Models\Product::find($item->product_id);
                    if ($product && $product->track_inventory) {
                        $product->decrement('current_stock', $item->quantity);
                    }
                }
            }
        });

        return redirect()->back()->with('success', 'Purchase Invoice voided successfully.');
    }
}
