<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use App\Services\TenantContext;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::orderBy('name')
            ->paginate(10);

        return Inertia::render('Master/Customers/Index', [
            'customers' => $customers,
        ]);
    }

    public function create()
    {
        return Inertia::render('Master/Customers/Create');
    }

    public function store(Request $request)
    {
        $tenantId = auth()->user()->current_tenant_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => [
                'nullable', 
                'string', 
                'max:50', 
                Rule::unique('customers')
                    ->where(fn ($query) => $query->where('tenant_id', $tenantId))
            ],
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'tax_identification_number' => 'nullable|string|max:50',
            'credit_limit' => 'nullable|numeric|min:0',
            'credit_days' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $validated['credit_limit'] = $validated['credit_limit'] ?? 0;
        $validated['credit_days'] = $validated['credit_days'] ?? 30;

        $customer = Customer::create($validated);

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json($customer);
        }

        return redirect()->route('master.customers.index')
            ->with('success', 'Customer created successfully.');
    }

    public function edit(Customer $customer)
    {
        return Inertia::render('Master/Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $tenantId = auth()->user()->current_tenant_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => [
                'nullable', 
                'string', 
                'max:50', 
                Rule::unique('customers')
                    ->ignore($customer->id)
                    ->where(fn ($query) => $query->where('tenant_id', $tenantId))
            ],
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'tax_identification_number' => 'nullable|string|max:50',
            'credit_limit' => 'nullable|numeric|min:0',
            'credit_days' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $validated['credit_limit'] = $validated['credit_limit'] ?? 0;
        $validated['credit_days'] = $validated['credit_days'] ?? 30;

        $customer->update($validated);

        return redirect()->route('master.customers.index')
            ->with('success', 'Customer updated successfully.');
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();

        return redirect()->route('master.customers.index')
            ->with('success', 'Customer deleted successfully.');
    }
}
