<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Unit;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use App\Services\TenantContext;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::orderBy('name')
            ->orderBy('id', 'desc')
            ->get();
        
        $categories = ProductCategory::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Master/Products/Index', [
            'products' => ['data' => $products],
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        $categories = ProductCategory::where('is_active', true)->orderBy('name')->get();
        
        return Inertia::render('Master/Products/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => ['nullable', 'string', 'max:50', Rule::unique('products')->where('tenant_id', TenantContext::getTenantId())],
            'type' => 'required|in:product,service',
            'retail_price' => 'required|numeric|min:0',
            'purchase_cost' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'track_inventory' => 'boolean',
            'current_stock' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        Product::create([
            // 'tenant_id' => 1,
            'name' => $validated['name'],
            'sku' => $validated['sku'],
            'type' => $validated['type'],
            'retail_price' => $validated['retail_price'],
            'purchase_cost' => $validated['purchase_cost'],
            'description' => $validated['description'],
            'track_inventory' => $validated['track_inventory'] ?? false,
            'current_stock' => $validated['current_stock'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('master.products.index')
            ->with('success', 'Product created successfully.');
    }

    public function edit(Product $product)
    {
        $categories = \App\Models\ProductCategory::where('is_active', true)->orderBy('name')->get();
        // $units = Unit::all();

        return Inertia::render('Master/Products/Edit', [
            'product' => $product,
            'categories' => $categories,
            // 'units' => $units,
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => ['nullable', 'string', 'max:50', Rule::unique('products')->ignore($product->id)->where('tenant_id', TenantContext::getTenantId())],
            'type' => 'required|in:product,service',
            'retail_price' => 'required|numeric|min:0',
            'purchase_cost' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'track_inventory' => 'boolean',
            'current_stock' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $product->update([
            'name' => $validated['name'],
            'sku' => $validated['sku'],
            'type' => $validated['type'],
            'retail_price' => $validated['retail_price'],
            'purchase_cost' => $validated['purchase_cost'],
            'description' => $validated['description'],
            'track_inventory' => $validated['track_inventory'] ?? false,
            'current_stock' => $validated['current_stock'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('master.products.index')
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product, Request $request)
    {
        // Check if bulk delete
        if ($request->has('ids')) {
            $ids = $request->input('ids');
            Product::whereIn('id', $ids)->delete();
            
            return redirect()->route('master.products.index')
                ->with('success', count($ids) . ' product(s) deleted successfully.');
        }
        
        // Single delete
        $product->delete();

        return redirect()->route('master.products.index')
            ->with('success', 'Product deleted successfully.');
    }
}
