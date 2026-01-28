<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\CashTransaction;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\ExpenseCategory;
use App\Models\BankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CashTransactionController extends Controller
{
    /**
     * Display a listing of cash transactions.
     */
    public function index(Request $request)
    {
        $this->authorize('sales.view');

        $query = CashTransaction::with(['customer', 'supplier', 'expenseCategory', 'bankAccount', 'product'])
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc');

        // Filter by type if specified
        if ($request->has('type') && in_array($request->type, ['cash_sale', 'cash_expense'])) {
            $query->where('type', $request->type);
        }

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('number', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        $transactions = $query->paginate(15)->withQueryString();

        // Summary statistics
        $summary = [
            'total_sales' => CashTransaction::cashSales()->sum('total'),
            'total_expenses' => CashTransaction::cashExpenses()->sum('total'),
            'today_sales' => CashTransaction::cashSales()->whereDate('date', today())->sum('total'),
            'today_expenses' => CashTransaction::cashExpenses()->whereDate('date', today())->sum('total'),
        ];

        return Inertia::render('Sales/CashTransactions/Index', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['type', 'search']),
            'customers' => Customer::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'suppliers' => Supplier::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'products' => Product::where('is_active', true)->orderBy('name')->get(['id', 'name', 'retail_price', 'sst_applicable']),
            'expenseCategories' => ExpenseCategory::orderBy('name')->get(['id', 'name']),
            'bankAccounts' => BankAccount::where('is_active', true)->orderBy('bank_name')->get(['id', 'bank_name', 'name', 'account_number']),
        ]);
    }

    /**
     * Store a newly created cash transaction.
     */
    public function store(Request $request)
    {
        $this->authorize('sales.create');

        $validated = $request->validate([
            'type' => 'required|in:cash_sale,cash_expense',
            'date' => 'required|date',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'tax_amount' => 'nullable|numeric|min:0',
            'payment_method' => 'required|in:cash,bank_transfer,cheque,credit_card,e_wallet',
            'bank_account_id' => 'nullable|exists:bank_accounts,id',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'receipt' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB max
            // For cash sales
            'customer_id' => 'nullable|exists:customers,id',
            'product_id' => 'nullable|exists:products,id',
            // For cash expenses
            'supplier_id' => 'nullable|exists:suppliers,id',
            'expense_category_id' => 'nullable|exists:expense_categories,id',
        ]);

        $transaction = DB::transaction(function () use ($validated, $request) {
            $taxAmount = $validated['tax_amount'] ?? 0;
            $total = $validated['amount'] + $taxAmount;

            // Generate transaction number
            $prefix = $validated['type'] === 'cash_sale' ? 'CS' : 'CE';
            $count = CashTransaction::withTrashed()->where('type', $validated['type'])->count() + 1;
            $number = $prefix . '-' . date('Ymd') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

            $transactionData = [
                'number' => $number,
                'type' => $validated['type'],
                'date' => $validated['date'],
                'description' => $validated['description'],
                'amount' => $validated['amount'],
                'tax_amount' => $taxAmount,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'bank_account_id' => $validated['bank_account_id'] ?? null,
                'reference_number' => $validated['reference_number'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'status' => 'draft',
            ];

            // Add type-specific fields
            if ($validated['type'] === 'cash_sale') {
                $transactionData['customer_id'] = $validated['customer_id'] ?? null;
                $transactionData['product_id'] = $validated['product_id'] ?? null;
            } else {
                $transactionData['supplier_id'] = $validated['supplier_id'] ?? null;
                $transactionData['expense_category_id'] = $validated['expense_category_id'] ?? null;
            }

            $transaction = CashTransaction::create($transactionData);

            // Handle receipt upload
            if ($request->hasFile('receipt')) {
                $file = $request->file('receipt');
                $filename = $file->getClientOriginalName();
                $path = $file->store('cash-transactions/' . $transaction->id, 'public');

                $transaction->update([
                    'receipt_path' => $path,
                    'receipt_filename' => $filename,
                ]);
            }

            return $transaction;
        });

        $typeLabel = $validated['type'] === 'cash_sale' ? 'Cash sale' : 'Cash expense';
        return redirect()->route('sales.cash-transactions.index')
            ->with('success', "{$typeLabel} recorded successfully.");
    }

    /**
     * Display the specified cash transaction.
     */
    public function show(CashTransaction $cashTransaction)
    {
        $this->authorize('sales.view');

        $cashTransaction->load(['customer', 'supplier', 'expenseCategory', 'bankAccount', 'product', 'journalEntry.lines.account']);

        return Inertia::render('Sales/CashTransactions/Show', [
            'transaction' => $cashTransaction,
        ]);
    }

    /**
     * Update the specified cash transaction.
     */
    public function update(Request $request, CashTransaction $cashTransaction)
    {
        $this->authorize('sales.edit');

        if ($cashTransaction->status === 'posted') {
            return back()->with('error', 'Cannot edit a posted transaction.');
        }

        $validated = $request->validate([
            'date' => 'required|date',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'tax_amount' => 'nullable|numeric|min:0',
            'payment_method' => 'required|in:cash,bank_transfer,cheque,credit_card,e_wallet',
            'bank_account_id' => 'nullable|exists:bank_accounts,id',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'receipt' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'customer_id' => 'nullable|exists:customers,id',
            'product_id' => 'nullable|exists:products,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'expense_category_id' => 'nullable|exists:expense_categories,id',
        ]);

        DB::transaction(function () use ($validated, $request, $cashTransaction) {
            $taxAmount = $validated['tax_amount'] ?? 0;
            $total = $validated['amount'] + $taxAmount;

            $cashTransaction->update([
                'date' => $validated['date'],
                'description' => $validated['description'],
                'amount' => $validated['amount'],
                'tax_amount' => $taxAmount,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'bank_account_id' => $validated['bank_account_id'] ?? null,
                'reference_number' => $validated['reference_number'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'customer_id' => $validated['customer_id'] ?? null,
                'product_id' => $validated['product_id'] ?? null,
                'supplier_id' => $validated['supplier_id'] ?? null,
                'expense_category_id' => $validated['expense_category_id'] ?? null,
            ]);

            // Handle receipt upload
            if ($request->hasFile('receipt')) {
                // Delete old receipt if exists
                if ($cashTransaction->receipt_path) {
                    Storage::disk('public')->delete($cashTransaction->receipt_path);
                }

                $file = $request->file('receipt');
                $filename = $file->getClientOriginalName();
                $path = $file->store('cash-transactions/' . $cashTransaction->id, 'public');

                $cashTransaction->update([
                    'receipt_path' => $path,
                    'receipt_filename' => $filename,
                ]);
            }
        });

        return back()->with('success', 'Transaction updated successfully.');
    }

    /**
     * Remove the specified cash transaction.
     */
    public function destroy(CashTransaction $cashTransaction)
    {
        $this->authorize('sales.delete');

        if ($cashTransaction->status === 'posted') {
            return back()->with('error', 'Cannot delete a posted transaction.');
        }

        // Delete uploaded receipt if exists
        if ($cashTransaction->receipt_path) {
            Storage::disk('public')->delete($cashTransaction->receipt_path);
        }

        $cashTransaction->delete();

        return redirect()->route('sales.cash-transactions.index')
            ->with('success', 'Transaction deleted successfully.');
    }

    /**
     * Upload or replace receipt for a transaction.
     */
    public function uploadReceipt(Request $request, CashTransaction $cashTransaction)
    {
        $this->authorize('sales.edit');

        $request->validate([
            'receipt' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        // Delete old receipt if exists
        if ($cashTransaction->receipt_path) {
            Storage::disk('public')->delete($cashTransaction->receipt_path);
        }

        $file = $request->file('receipt');
        $filename = $file->getClientOriginalName();
        $path = $file->store('cash-transactions/' . $cashTransaction->id, 'public');

        $cashTransaction->update([
            'receipt_path' => $path,
            'receipt_filename' => $filename,
        ]);

        return back()->with('success', 'Receipt uploaded successfully.');
    }

    /**
     * Remove receipt from a transaction.
     */
    public function removeReceipt(CashTransaction $cashTransaction)
    {
        $this->authorize('sales.edit');

        if ($cashTransaction->receipt_path) {
            Storage::disk('public')->delete($cashTransaction->receipt_path);
            $cashTransaction->update([
                'receipt_path' => null,
                'receipt_filename' => null,
            ]);
        }

        return back()->with('success', 'Receipt removed successfully.');
    }

    /**
     * Post a cash transaction (create journal entries).
     */
    public function post(CashTransaction $cashTransaction)
    {
        $this->authorize('sales.edit');

        if ($cashTransaction->status === 'posted') {
            return back()->with('error', 'Transaction is already posted.');
        }

        // TODO: Create journal entries based on transaction type
        // For now, just mark as posted
        $cashTransaction->update(['status' => 'posted']);

        return back()->with('success', 'Transaction posted successfully.');
    }

    /**
     * Void a cash transaction.
     */
    public function void(CashTransaction $cashTransaction)
    {
        $this->authorize('sales.edit');

        if ($cashTransaction->status === 'void') {
            return back()->with('error', 'Transaction is already voided.');
        }

        // TODO: Reverse journal entries if posted
        $cashTransaction->update(['status' => 'void']);

        return back()->with('success', 'Transaction voided successfully.');
    }
}
