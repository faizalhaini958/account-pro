<?php

namespace App\Http\Controllers\Purchase;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    protected \App\Services\NumberingService $numberingService;

    public function __construct(\App\Services\NumberingService $numberingService)
    {
        $this->numberingService = $numberingService;
    }
    public function index()
    {
        $this->authorize('purchases.view');

        $expenses = Expense::with(['category', 'supplier', 'bankAccount'])
            ->orderByDesc('date')
            ->paginate(10);

        $categories = ExpenseCategory::where('is_active', true)->orderBy('name')->get();
        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();
        $bankAccounts = BankAccount::where('is_active', true)->orderBy('bank_name')->get();

        return Inertia::render('Purchase/Expenses/Index', [
            'expenses' => $expenses,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'bankAccounts' => $bankAccounts,
        ]);
    }

    public function create()
    {
        $this->authorize('purchases.create');

        $categories = ExpenseCategory::where('is_active', true)->orderBy('name')->get();
        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();
        $bankAccounts = BankAccount::where('is_active', true)->orderBy('bank_name')->get();

        return Inertia::render('Purchase/Expenses/Create', [
            'categories' => $categories,
            'suppliers' => $suppliers,
            'bankAccounts' => $bankAccounts,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('purchases.create');

        // Sanitize inputs before validation
        $inputs = $request->all();
        if (isset($inputs['supplier_id']) && $inputs['supplier_id'] === '0') {
            $inputs['supplier_id'] = null;
        }
        if (isset($inputs['bank_account_id']) && $inputs['bank_account_id'] === '0') {
            $inputs['bank_account_id'] = null;
        }
        $request->merge($inputs);

        $validated = $request->validate([
            'date' => 'required|date',
            'expense_category_id' => 'required|exists:expense_categories,id',
            'amount' => 'required|numeric|min:0.01',
            'tax_amount' => 'nullable|numeric|min:0',
            'reference_number' => 'nullable|string|max:50',
            'description' => 'required|string',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'bank_account_id' => 'nullable|exists:bank_accounts,id',
            'payment_method' => 'nullable|string|max:50',
        ]);

        // Sanitization handled before validation
        // if (isset($validated['supplier_id']) && $validated['supplier_id'] === '0') {
        //     $validated['supplier_id'] = null;
        // }

        // if (isset($validated['bank_account_id']) && $validated['bank_account_id'] === '0') {
        //     $validated['bank_account_id'] = null;
        // }

        Expense::create([
            // 'tenant_id' => 1, // Fallback
            ...$validated,
            'number' => $this->numberingService->generate('expense', 'EXP-'),
            'status' => 'posted', // Auto-post for now
        ]);

        return redirect()->route('purchase.expenses.index')
            ->with('success', 'Expense recorded successfully.');
    }

    public function edit(Expense $expense)
    {
        $this->authorize('purchases.edit');

        $categories = ExpenseCategory::where('is_active', true)->orderBy('name')->get();
        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();
        $bankAccounts = BankAccount::where('is_active', true)->orderBy('bank_name')->get();

        return Inertia::render('Purchase/Expenses/Edit', [
            'expense' => $expense,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'bankAccounts' => $bankAccounts,
        ]);
    }

    public function update(Request $request, Expense $expense)
    {
        $this->authorize('purchases.edit');

        // Sanitize inputs before validation
        $inputs = $request->all();
        if (isset($inputs['supplier_id']) && $inputs['supplier_id'] === '0') {
            $inputs['supplier_id'] = null;
        }
        if (isset($inputs['bank_account_id']) && $inputs['bank_account_id'] === '0') {
            $inputs['bank_account_id'] = null;
        }
        $request->merge($inputs);

        $validated = $request->validate([
            'date' => 'required|date',
            'expense_category_id' => 'required|exists:expense_categories,id',
            'amount' => 'required|numeric|min:0.01',
            'tax_amount' => 'nullable|numeric|min:0',
            'reference_number' => 'nullable|string|max:50',
            'description' => 'required|string',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'bank_account_id' => 'nullable|exists:bank_accounts,id',
            'payment_method' => 'nullable|string|max:50',
        ]);

        // Sanitization handled before validation
        // if (isset($validated['supplier_id']) && $validated['supplier_id'] === '0') {
        //     $validated['supplier_id'] = null;
        // }

        // if (isset($validated['bank_account_id']) && $validated['bank_account_id'] === '0') {
        //     $validated['bank_account_id'] = null;
        // }

        $expense->update($validated);

        return redirect()->route('purchase.expenses.index')
            ->with('success', 'Expense updated successfully.');
    }

    public function destroy(Expense $expense)
    {
        $this->authorize('purchases.delete');

        $expense->delete();

        return redirect()->route('purchase.expenses.index')
            ->with('success', 'Expense deleted successfully.');
    }
}
