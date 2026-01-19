<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\DeliveryOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeliveryOrderController extends Controller
{
    public function index()
    {
        $this->authorize('sales.view');

        $deliveryOrders = DeliveryOrder::with(['customer'])
            ->latest()
            ->paginate(10);

        $customers = \App\Models\Customer::orderBy('name')->select('id', 'name', 'company_name')->get();
        $products = \App\Models\Product::where('is_active', true)->orderBy('name')->select('id', 'name', 'sku')->get();

        return Inertia::render('Sales/DeliveryOrders/Index', [
            'deliveryOrders' => $deliveryOrders,
            'customers' => $customers,
            'products' => $products,
        ]);
    }

    public function create()
    {
        $this->authorize('sales.create');

        $customers = \App\Models\Customer::orderBy('name')->select('id', 'name', 'company_name')->get();
        $products = \App\Models\Product::where('is_active', true)->orderBy('name')->select('id', 'name', 'sku')->get();

        return Inertia::render('Sales/DeliveryOrders/Create', [
            'customers' => $customers,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('sales.create');

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'date' => 'required|date',
            'delivered_at' => 'nullable|date',
            'delivery_address' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'notes' => 'nullable|string',
        ]);

        return \DB::transaction(function () use ($validated) {
            $count = \App\Models\DeliveryOrder::count() + 1;
            $number = 'DO-' . date('Y') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

            $do = \App\Models\DeliveryOrder::create([
                // 'tenant_id' => 1, // Handled automatically by TenantScoped trait
                'customer_id' => $validated['customer_id'],
                'number' => $number,
                'date' => $validated['date'],
                'delivered_at' => $validated['delivered_at'],
                'delivery_address' => $validated['delivery_address'],
                'status' => 'draft',
                'notes' => $validated['notes'],
            ]);

            $do->items()->createMany($validated['items']);

            return redirect()->route('sales.delivery-orders.index')
                ->with('success', 'Delivery Order created successfully.');
        });
    }

    public function edit(DeliveryOrder $deliveryOrder)
    {
        $this->authorize('sales.edit');

        $deliveryOrder->load('items');

        $customers = \App\Models\Customer::orderBy('name')->select('id', 'name', 'company_name')->get();
        $products = \App\Models\Product::where('is_active', true)->orderBy('name')->select('id', 'name', 'sku')->get();

        return Inertia::render('Sales/DeliveryOrders/Edit', [
            'deliveryOrder' => $deliveryOrder,
            'customers' => $customers,
            'products' => $products,
        ]);
    }

    public function update(Request $request, DeliveryOrder $deliveryOrder)
    {
        $this->authorize('sales.edit');

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'date' => 'required|date',
            'delivered_at' => 'nullable|date',
            'delivery_address' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'notes' => 'nullable|string',
        ]);

        return \DB::transaction(function () use ($validated, $deliveryOrder) {
            $deliveryOrder->update([
                'customer_id' => $validated['customer_id'],
                'date' => $validated['date'],
                'delivered_at' => $validated['delivered_at'],
                'delivery_address' => $validated['delivery_address'],
                'notes' => $validated['notes'],
            ]);

            $deliveryOrder->items()->delete();
            $deliveryOrder->items()->createMany($validated['items']);

            return redirect()->route('sales.delivery-orders.index')
                ->with('success', 'Delivery Order updated successfully.');
        });
    }

    public function destroy(DeliveryOrder $deliveryOrder)
    {
        $this->authorize('sales.delete');

        if ($deliveryOrder->status !== 'draft') {
            return back()->with('error', 'Only draft delivery orders can be deleted.');
        }

        $deliveryOrder->items()->delete();
        $deliveryOrder->delete();

        return redirect()->route('sales.delivery-orders.index')
            ->with('success', 'Delivery Order deleted successfully.');
    }
    public function pdf(DeliveryOrder $deliveryOrder)
    {
        $this->authorize('sales.view');

        $deliveryOrder->load(['customer', 'items.product', 'tenant']);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.delivery-order', [
            'deliveryOrder' => $deliveryOrder,
            'tenant' => $deliveryOrder->tenant,
        ]);

        return $pdf->download('delivery-order-' . $deliveryOrder->number . '.pdf');
    }
}
