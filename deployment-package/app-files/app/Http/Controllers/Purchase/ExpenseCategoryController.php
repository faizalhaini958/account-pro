<?php

namespace App\Http\Controllers\Purchase;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseCategoryController extends Controller
{
    public function index()
    {
        $this->authorize('purchases.view');

        $categories = ExpenseCategory::with('account')
            ->orderBy('name')
            ->paginate(10);



        $accounts = ChartOfAccount::where('type', 'expense')
            ->orderBy('code')
            ->get();

        return Inertia::render('Purchase/ExpenseCategories/Index', [
            'categories' => $categories,
            'accounts' => $accounts,
        ]);
    }

    public function create()
    {
        $this->authorize('purchases.create');

        $accounts = ChartOfAccount::where('type', 'expense')
            ->orderBy('code')
            ->get();

        return Inertia::render('Purchase/ExpenseCategories/Create', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('purchases.create');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'account_id' => 'required|exists:chart_of_accounts,id',
            'is_active' => 'boolean',
        ]);

        $category = ExpenseCategory::create($validated);
        


        return redirect()->route('purchase.expense-categories.index')
            ->with('success', 'Expense Category created successfully.');
    }

    public function edit(ExpenseCategory $expenseCategory)
    {
        $this->authorize('purchases.edit');

        $accounts = ChartOfAccount::where('type', 'expense')
            ->orderBy('code')
            ->get();

        return Inertia::render('Purchase/ExpenseCategories/Edit', [
            'category' => $expenseCategory,
            'accounts' => $accounts,
        ]);
    }

    public function update(Request $request, ExpenseCategory $expenseCategory)
    {
        $this->authorize('purchases.edit');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'account_id' => 'required|exists:chart_of_accounts,id',
            'is_active' => 'boolean',
        ]);

        $expenseCategory->update($validated);

        return redirect()->route('purchase.expense-categories.index')
            ->with('success', 'Expense Category updated successfully.');
    }

    public function destroy(ExpenseCategory $expenseCategory)
    {
        $expenseCategory->delete();

        return redirect()->route('purchase.expense-categories.index')
            ->with('success', 'Expense Category deleted successfully.');
    }
}
