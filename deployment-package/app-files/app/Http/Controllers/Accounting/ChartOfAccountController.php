<?php

namespace App\Http\Controllers\Accounting;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Services\TenantContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class ChartOfAccountController extends Controller
{
    public function index()
    {
        $this->authorize('accounting.view');

        // Debug tenant context
        \Log::info('COA Index - Tenant Check', [
            'tenant_context_check' => TenantContext::check(),
            'tenant_id' => TenantContext::getTenantId(),
            'user_current_tenant_id' => auth()->user()?->current_tenant_id,
        ]);

        $accounts = ChartOfAccount::with('parent')
            ->orderBy('code')
            ->get()
            ->groupBy('type');

        \Log::info('COA Index - Accounts Count', [
            'count' => $accounts->flatten()->count(),
        ]);

        $parents = ChartOfAccount::orderBy('code')->get();

        return Inertia::render('Accounting/CoA/Index', [
            'accounts' => $accounts,
            'parents' => $parents,
            'types' => $this->getAccountTypes(),
        ]);
    }

    public function create()
    {
        $this->authorize('accounting.create');

        $parents = ChartOfAccount::orderBy('code')->get();

        return Inertia::render('Accounting/CoA/Create', [
            'parents' => $parents,
            'types' => $this->getAccountTypes(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('accounting.create');

        $tenantId = auth()->user()->current_tenant_id;

        $validated = $request->validate([
            'code' => [
                'required', 
                'string', 
                'max:20', 
                Rule::unique('chart_of_accounts')
                    ->where(fn ($query) => $query->where('tenant_id', $tenantId))
            ],
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'subtype' => 'nullable|string',
            'parent_id' => 'nullable|exists:chart_of_accounts,id',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['is_system'] = false;

        ChartOfAccount::create($validated);

        return redirect()->route('accounting.coa.index')
            ->with('success', 'Account created successfully.');
    }

    public function edit(ChartOfAccount $chartOfAccount)
    {
        $this->authorize('accounting.edit');

        $parents = ChartOfAccount::where('id', '!=', $chartOfAccount->id)
            ->orderBy('code')
            ->get();

        return Inertia::render('Accounting/CoA/Edit', [
            'account' => $chartOfAccount,
            'parents' => $parents,
            'types' => $this->getAccountTypes(),
        ]);
    }

    public function update(Request $request, ChartOfAccount $chartOfAccount)
    {
        $this->authorize('accounting.edit');

        $tenantId = auth()->user()->current_tenant_id;

        $validated = $request->validate([
            'code' => [
                'required', 
                'string', 
                'max:20', 
                Rule::unique('chart_of_accounts')
                    ->ignore($chartOfAccount->id)
                    ->where(fn ($query) => $query->where('tenant_id', $tenantId))
            ],
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'subtype' => 'nullable|string',
            'parent_id' => 'nullable|exists:chart_of_accounts,id',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // Prevent changing type of system accounts if needed, but allow for now with caution
        if ($chartOfAccount->is_system && $chartOfAccount->code !== $validated['code']) {
             // Optional: Block code change for system accounts to prevent breaking hardcoded lookups
             // return back()->with('error', 'Cannot change code of system account.');
        }

        $chartOfAccount->update($validated);

        return redirect()->route('accounting.coa.index')
            ->with('success', 'Account updated successfully.');
    }

    public function destroy(ChartOfAccount $chartOfAccount)
    {
        $this->authorize('accounting.delete');

        if ($chartOfAccount->is_system) {
            return back()->with('error', 'Cannot delete system account.');
        }

        // Check for transactions
        // if ($chartOfAccount->journalLines()->exists()) { return back()->with('error', 'Cannot delete account with transactions.'); }

        $chartOfAccount->delete();

        return redirect()->route('accounting.coa.index')
            ->with('success', 'Account deleted successfully.');
    }

    public function seedDefaults()
    {
        $this->authorize('accounting.create');

        // Check if accounts already exist - prevent duplicate seeding
        $existingCount = ChartOfAccount::count();
        if ($existingCount > 0) {
            return redirect()->route('accounting.coa.index')
                ->with('error', 'Default accounts have already been loaded or Chart of Accounts contains existing data. Cannot seed defaults multiple times.');
        }

        // Use database transaction to ensure atomicity - all or nothing
        try {
            \DB::beginTransaction();

            // Malaysian Standard Chart of Accounts
            $defaultAccounts = [
                // ASSETS (1000-1999)
                ['code' => '1000', 'name' => 'ASSETS', 'type' => 'asset', 'subtype' => null, 'is_system' => true],

                // Current Assets (1100-1199)
                ['code' => '1100', 'name' => 'Current Assets', 'type' => 'asset', 'subtype' => 'current_asset', 'is_system' => true],
                ['code' => '1101', 'name' => 'Cash in Hand', 'type' => 'asset', 'subtype' => 'cash', 'is_system' => false],
                ['code' => '1102', 'name' => 'Cash at Bank - Operating Account', 'type' => 'asset', 'subtype' => 'bank', 'is_system' => false],
                ['code' => '1103', 'name' => 'Cash at Bank - Savings Account', 'type' => 'asset', 'subtype' => 'bank', 'is_system' => false],
                ['code' => '1110', 'name' => 'Accounts Receivable', 'type' => 'asset', 'subtype' => 'receivable', 'is_system' => true],
                ['code' => '1120', 'name' => 'Inventory', 'type' => 'asset', 'subtype' => 'inventory', 'is_system' => false],
                ['code' => '1130', 'name' => 'Prepaid Expenses', 'type' => 'asset', 'subtype' => 'prepaid', 'is_system' => false],

                // Fixed Assets (1200-1299)
                ['code' => '1200', 'name' => 'Fixed Assets', 'type' => 'asset', 'subtype' => 'fixed_asset', 'is_system' => true],
                ['code' => '1201', 'name' => 'Property', 'type' => 'asset', 'subtype' => 'fixed_asset', 'is_system' => false],
                ['code' => '1202', 'name' => 'Equipment', 'type' => 'asset', 'subtype' => 'fixed_asset', 'is_system' => false],
                ['code' => '1203', 'name' => 'Furniture & Fixtures', 'type' => 'asset', 'subtype' => 'fixed_asset', 'is_system' => false],
                ['code' => '1204', 'name' => 'Vehicles', 'type' => 'asset', 'subtype' => 'fixed_asset', 'is_system' => false],
                ['code' => '1205', 'name' => 'Computer & IT Equipment', 'type' => 'asset', 'subtype' => 'fixed_asset', 'is_system' => false],
                ['code' => '1210', 'name' => 'Accumulated Depreciation', 'type' => 'asset', 'subtype' => 'depreciation', 'is_system' => false],

                // LIABILITIES (2000-2999)
                ['code' => '2000', 'name' => 'LIABILITIES', 'type' => 'liability', 'subtype' => null, 'is_system' => true],

                // Current Liabilities (2100-2199)
                ['code' => '2100', 'name' => 'Current Liabilities', 'type' => 'liability', 'subtype' => 'current_liability', 'is_system' => true],
                ['code' => '2101', 'name' => 'Accounts Payable', 'type' => 'liability', 'subtype' => 'payable', 'is_system' => true],
                ['code' => '2102', 'name' => 'Credit Card Payable', 'type' => 'liability', 'subtype' => 'payable', 'is_system' => false],
                ['code' => '2110', 'name' => 'Sales Tax Payable (SST)', 'type' => 'liability', 'subtype' => 'tax_payable', 'is_system' => false],
                ['code' => '2111', 'name' => 'Service Tax Payable', 'type' => 'liability', 'subtype' => 'tax_payable', 'is_system' => false],
                ['code' => '2120', 'name' => 'Accrued Expenses', 'type' => 'liability', 'subtype' => 'accrued', 'is_system' => false],
                ['code' => '2130', 'name' => 'Unearned Revenue', 'type' => 'liability', 'subtype' => 'deferred', 'is_system' => false],

                // Long-term Liabilities (2200-2299)
                ['code' => '2200', 'name' => 'Long-term Liabilities', 'type' => 'liability', 'subtype' => 'long_term', 'is_system' => false],
                ['code' => '2201', 'name' => 'Bank Loan', 'type' => 'liability', 'subtype' => 'loan', 'is_system' => false],
                ['code' => '2202', 'name' => 'Hire Purchase', 'type' => 'liability', 'subtype' => 'loan', 'is_system' => false],

                // EQUITY (3000-3999)
                ['code' => '3000', 'name' => 'EQUITY', 'type' => 'equity', 'subtype' => null, 'is_system' => true],
                ['code' => '3100', 'name' => 'Capital', 'type' => 'equity', 'subtype' => 'capital', 'is_system' => true],
                ['code' => '3200', 'name' => 'Retained Earnings', 'type' => 'equity', 'subtype' => 'retained_earnings', 'is_system' => true],
                ['code' => '3300', 'name' => 'Drawings', 'type' => 'equity', 'subtype' => 'drawings', 'is_system' => false],

                // REVENUE / INCOME (4000-4999)
                ['code' => '4000', 'name' => 'REVENUE', 'type' => 'income', 'subtype' => null, 'is_system' => true],
                ['code' => '4100', 'name' => 'Sales Revenue', 'type' => 'income', 'subtype' => 'sales', 'is_system' => true],
                ['code' => '4200', 'name' => 'Service Revenue', 'type' => 'income', 'subtype' => 'service', 'is_system' => false],
                ['code' => '4300', 'name' => 'Other Income', 'type' => 'income', 'subtype' => 'other', 'is_system' => false],
                ['code' => '4301', 'name' => 'Interest Income', 'type' => 'income', 'subtype' => 'interest', 'is_system' => false],
                ['code' => '4302', 'name' => 'Discount Received', 'type' => 'income', 'subtype' => 'discount', 'is_system' => false],

                // COST OF GOODS SOLD (5000-5999)
                ['code' => '5000', 'name' => 'COST OF GOODS SOLD', 'type' => 'cogs', 'subtype' => null, 'is_system' => true],
                ['code' => '5100', 'name' => 'Cost of Goods Sold', 'type' => 'cogs', 'subtype' => 'cogs', 'is_system' => true],
                ['code' => '5200', 'name' => 'Freight & Delivery', 'type' => 'cogs', 'subtype' => 'freight', 'is_system' => false],

                // EXPENSES (6000-6999)
                ['code' => '6000', 'name' => 'EXPENSES', 'type' => 'expense', 'subtype' => null, 'is_system' => true],

                // Operating Expenses
                ['code' => '6100', 'name' => 'Salaries & Wages', 'type' => 'expense', 'subtype' => 'payroll', 'is_system' => false],
                ['code' => '6110', 'name' => 'EPF Contribution', 'type' => 'expense', 'subtype' => 'payroll', 'is_system' => false],
                ['code' => '6111', 'name' => 'SOCSO Contribution', 'type' => 'expense', 'subtype' => 'payroll', 'is_system' => false],
                ['code' => '6112', 'name' => 'EIS Contribution', 'type' => 'expense', 'subtype' => 'payroll', 'is_system' => false],
                ['code' => '6200', 'name' => 'Rent Expense', 'type' => 'expense', 'subtype' => 'operating', 'is_system' => false],
                ['code' => '6210', 'name' => 'Utilities Expense', 'type' => 'expense', 'subtype' => 'operating', 'is_system' => false],
                ['code' => '6220', 'name' => 'Telephone & Internet', 'type' => 'expense', 'subtype' => 'operating', 'is_system' => false],
                ['code' => '6230', 'name' => 'Office Supplies', 'type' => 'expense', 'subtype' => 'operating', 'is_system' => false],
                ['code' => '6240', 'name' => 'Insurance', 'type' => 'expense', 'subtype' => 'operating', 'is_system' => false],
                ['code' => '6250', 'name' => 'Professional Fees', 'type' => 'expense', 'subtype' => 'professional', 'is_system' => false],
                ['code' => '6260', 'name' => 'Marketing & Advertising', 'type' => 'expense', 'subtype' => 'marketing', 'is_system' => false],
                ['code' => '6270', 'name' => 'Repairs & Maintenance', 'type' => 'expense', 'subtype' => 'maintenance', 'is_system' => false],
                ['code' => '6280', 'name' => 'Travel & Transport', 'type' => 'expense', 'subtype' => 'travel', 'is_system' => false],
                ['code' => '6290', 'name' => 'Depreciation Expense', 'type' => 'expense', 'subtype' => 'depreciation', 'is_system' => false],
                ['code' => '6300', 'name' => 'Bank Charges', 'type' => 'expense', 'subtype' => 'bank_charges', 'is_system' => false],
                ['code' => '6310', 'name' => 'Interest Expense', 'type' => 'expense', 'subtype' => 'interest', 'is_system' => false],
                ['code' => '6320', 'name' => 'Bad Debt Expense', 'type' => 'expense', 'subtype' => 'bad_debt', 'is_system' => false],
                ['code' => '6330', 'name' => 'License & Permit Fees', 'type' => 'expense', 'subtype' => 'compliance', 'is_system' => false],
                ['code' => '6900', 'name' => 'Miscellaneous Expense', 'type' => 'expense', 'subtype' => 'other', 'is_system' => false],
            ];

            foreach ($defaultAccounts as $account) {
                ChartOfAccount::create([
                    'code' => $account['code'],
                    'name' => $account['name'],
                    'type' => $account['type'],
                    'subtype' => $account['subtype'],
                    'is_system' => $account['is_system'],
                    'is_active' => true,
                    // tenant_id is automatically set by TenantScoped trait
                ]);
            }

            \DB::commit();

            return redirect()->route('accounting.coa.index')
                ->with('success', 'Default Malaysian Chart of Accounts has been created successfully! ' . count($defaultAccounts) . ' accounts loaded.');
        } catch (\Exception $e) {
            \DB::rollBack();

            return redirect()->route('accounting.coa.index')
                ->with('error', 'Failed to load default accounts: ' . $e->getMessage());
        }
    }

    private function getAccountTypes()
    {
        return [
            'asset' => 'Asset',
            'liability' => 'Liability',
            'equity' => 'Equity',
            'income' => 'Income',
            'expense' => 'Expense',
            'cogs' => 'Cost of Goods Sold',
        ];
    }
}
