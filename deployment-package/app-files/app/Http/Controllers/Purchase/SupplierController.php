<?php

namespace App\Http\Controllers\Purchase;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index()
    {
        $this->authorize('purchases.view');

        $suppliers = Supplier::orderBy('name')
            ->paginate(10);

        return Inertia::render('Purchase/Suppliers/Index', [
            'suppliers' => $suppliers,
        ]);
    }

    public function create()
    {
        $this->authorize('purchases.create');

        return Inertia::render('Purchase/Suppliers/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('purchases.create');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postcode' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'tax_id' => 'nullable|string|max:50',
            'payment_terms' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        Supplier::create([
            ...$validated,
            'is_active' => true,
        ]);

        return redirect()->route('purchase.suppliers.index')
            ->with('success', 'Supplier created successfully.');
    }

    public function edit(Supplier $supplier)
    {
        $this->authorize('purchases.edit');

        return Inertia::render('Purchase/Suppliers/Edit', [
            'supplier' => $supplier,
        ]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $this->authorize('purchases.edit');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postcode' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'tax_id' => 'nullable|string|max:50',
            'payment_terms' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $supplier->update($validated);

        return redirect()->route('purchase.suppliers.index')
            ->with('success', 'Supplier updated successfully.');
    }

    public function destroy(Supplier $supplier)
    {
        $this->authorize('purchases.delete');

        $supplier->delete();

        return redirect()->route('purchase.suppliers.index')
            ->with('success', 'Supplier deleted successfully.');
    }
}
