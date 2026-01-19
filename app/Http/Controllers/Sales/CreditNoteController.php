<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\CreditNote;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CreditNoteController extends Controller
{
    public function index()
    {
        $this->authorize('sales.view');

        $creditNotes = CreditNote::with(['customer'])
            ->latest()
            ->paginate(10);

        $customers = \App\Models\Customer::orderBy('name')->select('id', 'name', 'company_name')->get();
        $products = \App\Models\Product::where('is_active', true)->orderBy('name')->select('id', 'name', 'sku', 'retail_price', 'unit_id')->get();
        
        $invoices = \App\Models\Invoice::whereIn('status', ['posted', 'partial', 'paid', 'overdue'])
            ->orderBy('number', 'desc')
            ->select('id', 'number', 'customer_id', 'date', 'total', 'outstanding_amount')
            ->get();

        return Inertia::render('Sales/CreditNotes/Index', [
            'creditNotes' => $creditNotes,
            'customers' => $customers,
            'products' => $products,
            'invoices' => $invoices,
        ]);
    }

    public function create()
    {
        $this->authorize('sales.create');

        $customers = \App\Models\Customer::orderBy('name')->select('id', 'name', 'company_name')->get();
        $products = \App\Models\Product::where('is_active', true)->orderBy('name')->select('id', 'name', 'sku', 'retail_price', 'unit_id')->get();
        
        $invoices = \App\Models\Invoice::whereIn('status', ['posted', 'partial', 'paid', 'overdue'])
            ->orderBy('number', 'desc')
            ->select('id', 'number', 'date', 'total', 'outstanding_amount', 'customer_id')
            ->get();

        return Inertia::render('Sales/CreditNotes/Create', [
            'customers' => $customers,
            'products' => $products,
            'invoices' => $invoices,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('sales.create');

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'date' => 'required|date',
            'invoice_id' => 'nullable|exists:invoices,id', // Optional linking
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_amount' => 'nullable|numeric|min:0',
            'items.*.tax_percent' => 'nullable|numeric|min:0',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        return \DB::transaction(function () use ($validated) {
            $count = \App\Models\CreditNote::count() + 1;
            $number = 'CN-' . date('Y') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

            $subtotal = 0;
            $taxAmount = 0;
            $discountAmount = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $qty = $item['quantity'];
                $price = $item['unit_price'];
                $discount = $item['discount_amount'] ?? 0;
                $taxPct = $item['tax_percent'] ?? 0;

                $lineTotalBeforeTax = ($qty * $price) - $discount;
                $lineTax = $lineTotalBeforeTax * ($taxPct / 100);
                $lineTotal = $lineTotalBeforeTax + $lineTax;

                $subtotal += ($qty * $price);
                $discountAmount += $discount;
                $taxAmount += $lineTax;

                $itemsData[] = [
                    'product_id' => $item['product_id'],
                    'description' => $item['description'],
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'discount_amount' => $discount,
                    'tax_percent' => $taxPct,
                    'tax_amount' => $lineTax,
                    'total' => $lineTotal,
                ];
            }

            $total = $subtotal - $discountAmount + $taxAmount;

            $cn = \App\Models\CreditNote::create([
                // 'tenant_id' => 1, // Handled automatically by TenantScoped trait
                'customer_id' => $validated['customer_id'],
                'invoice_id' => $validated['invoice_id'] ?? null,
                'number' => $number,
                'date' => $validated['date'],
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'status' => 'draft',
                'reason' => $validated['reason'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            $cn->items()->createMany($itemsData);

            return redirect()->route('sales.credit-notes.index')
                ->with('success', 'Credit Note created successfully.');
        });
    }

    public function edit(CreditNote $creditNote)
    {
        $this->authorize('sales.edit');

        $creditNote->load('items');

        $customers = \App\Models\Customer::orderBy('name')->select('id', 'name', 'company_name')->get();
        $products = \App\Models\Product::where('is_active', true)->orderBy('name')->select('id', 'name', 'sku', 'retail_price')->get();
        
        $invoices = \App\Models\Invoice::whereIn('status', ['posted', 'partial', 'paid', 'overdue'])
            ->orderBy('number', 'desc')
            ->select('id', 'number', 'date', 'total', 'outstanding_amount', 'customer_id')
            ->get();

        return Inertia::render('Sales/CreditNotes/Edit', [
            'creditNote' => $creditNote,
            'customers' => $customers,
            'products' => $products,
            'invoices' => $invoices,
        ]);
    }

    public function update(Request $request, CreditNote $creditNote)
    {
        $this->authorize('sales.edit');

        if ($creditNote->status !== 'draft') {
            return back()->with('error', 'Only draft credit notes can be edited.');
        }

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'date' => 'required|date',
            'invoice_id' => 'nullable|exists:invoices,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_amount' => 'nullable|numeric|min:0',
            'items.*.tax_percent' => 'nullable|numeric|min:0',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        return \DB::transaction(function () use ($validated, $creditNote) {
            $subtotal = 0;
            $taxAmount = 0;
            $discountAmount = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $qty = $item['quantity'];
                $price = $item['unit_price'];
                $discount = $item['discount_amount'] ?? 0;
                $taxPct = $item['tax_percent'] ?? 0;

                $lineTotalBeforeTax = ($qty * $price) - $discount;
                $lineTax = $lineTotalBeforeTax * ($taxPct / 100);
                $lineTotal = $lineTotalBeforeTax + $lineTax;

                $subtotal += ($qty * $price);
                $discountAmount += $discount;
                $taxAmount += $lineTax;

                $itemsData[] = [
                    'product_id' => $item['product_id'],
                    'description' => $item['description'],
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'discount_amount' => $discount,
                    'tax_percent' => $taxPct,
                    'tax_amount' => $lineTax,
                    'total' => $lineTotal,
                ];
            }

            $total = $subtotal - $discountAmount + $taxAmount;

            $creditNote->update([
                'customer_id' => $validated['customer_id'],
                'invoice_id' => $validated['invoice_id'] ?? null,
                'date' => $validated['date'],
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'reason' => $validated['reason'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            $creditNote->items()->delete();
            $creditNote->items()->createMany($itemsData);

            return redirect()->route('sales.credit-notes.index')
                ->with('success', 'Credit Note updated successfully.');
        });
    }

    public function destroy(CreditNote $creditNote)
    {
        $this->authorize('sales.delete');

        if ($creditNote->status !== 'draft') {
            return back()->with('error', 'Only draft credit notes can be deleted.');
        }

        $creditNote->items()->delete();
        $creditNote->delete();

        return redirect()->route('sales.credit-notes.index')
            ->with('success', 'Credit Note deleted successfully.');
    }

    public function post(CreditNote $creditNote)
    {
        $this->authorize('sales.approve');

        if ($creditNote->status !== 'draft') {
            return back()->with('error', 'Only draft credit notes can be posted.');
        }

        \DB::transaction(function () use ($creditNote) {
            $creditNote->update(['status' => 'posted']);

            // If linked to an invoice, reduce its outstanding amount
            if ($creditNote->invoice_id) {
                $invoice = $creditNote->invoice;
                $invoice->outstanding_amount = max(0, $invoice->outstanding_amount - $creditNote->total);
                
                // If outstanding becomes 0, mark invoice as paid if it wasn't already? 
                // Creating a CN doesn't necessarily mean "Paid", but it settles the debt. 
                // Let's keep status as is or maybe check if 0 set to 'paid'?
                // For now just reducing outstanding is the key accounting action.
                if ($invoice->outstanding_amount == 0 && $invoice->status != 'paid') {
                     $invoice->status = 'paid';
                }
                
                $invoice->save();
            }
        });

        return back()->with('success', 'Credit Note posted successfully.');
    }

    public function pdf(CreditNote $creditNote)
    {
        $this->authorize('sales.view');

        $creditNote->load(['customer', 'items', 'invoice', 'tenant']);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.credit-note', [
            'creditNote' => $creditNote,
            'tenant' => $creditNote->tenant,
        ]);

        return $pdf->download('credit-note-' . $creditNote->number . '.pdf');
    }
}
