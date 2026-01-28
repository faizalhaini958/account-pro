<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class ProductCategoryController extends Controller
{
    public function index()
    {
        $categories = ProductCategory::with('parent')
            ->orderBy('name')
            ->get();
        
        $parents = ProductCategory::whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Master/Categories/Index', [
            'categories' => $categories,
            'parents' => $parents,
        ]);
    }

    public function create()
    {
        $parents = ProductCategory::where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Master/Categories/Create', [
            'parents' => $parents,
        ]);
    }

    public function store(Request $request)
    {
        $tenantId = auth()->user()->current_tenant_id;

        $validated = $request->validate([
            'name' => [
                'required', 
                'string', 
                'max:255', 
                Rule::unique('product_categories')
                    ->where(fn ($query) => $query->where('tenant_id', $tenantId))
                    ->withoutTrashed()
            ],
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:product_categories,id',
            'is_active' => 'boolean',
        ]);

        // TenantScoped trait will automatically set the tenant_id from context/auth
        // but we can pass it explicitly if needed. The trait handles it on 'creating'.

        ProductCategory::create($validated);

        return redirect()->route('master.categories.index')
            ->with('success', 'Category created successfully.');
    }

    public function edit(ProductCategory $category)
    {
        $parents = ProductCategory::where('id', '!=', $category->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Master/Categories/Edit', [
            'category' => $category,
            'parents' => $parents,
        ]);
    }

    public function update(Request $request, ProductCategory $category)
    {
        $tenantId = auth()->user()->current_tenant_id;

        $validated = $request->validate([
            'name' => [
                'required', 
                'string', 
                'max:255', 
                Rule::unique('product_categories')
                    ->ignore($category->id)
                    ->where(fn ($query) => $query->where('tenant_id', $tenantId))
                    ->withoutTrashed()
            ],
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:product_categories,id',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);

        return redirect()->route('master.categories.index')
            ->with('success', 'Category updated successfully.');
    }

    public function destroy(ProductCategory $category, Request $request)
    {
        // Check if bulk delete
        if ($request->has('ids')) {
            $ids = $request->input('ids');
            
            // Check if any category has children
            $hasChildren = ProductCategory::whereIn('id', $ids)
                ->whereHas('children')
                ->exists();
                
            if ($hasChildren) {
                return back()->with('error', 'Cannot delete categories with sub-categories.');
            }
            
            ProductCategory::whereIn('id', $ids)->delete();
            
            return redirect()->route('master.categories.index')
                ->with('success', count($ids) . ' categor' . (count($ids) > 1 ? 'ies' : 'y') . ' deleted successfully.');
        }
        
        // Single delete
        if ($category->children()->exists()) {
            return back()->with('error', 'Cannot delete category with sub-categories. Delete them first or reassign them.');
        }

        // Check for products
        // if ($category->products()->exists()) { return back()->with('error', 'Cannot delete category with assigned products.'); }

        $category->delete();

        return redirect()->route('master.categories.index')
            ->with('success', 'Category deleted successfully.');
    }
}
