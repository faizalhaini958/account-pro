<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add all the missing subtype values used in TenantObserver
        DB::statement("ALTER TABLE chart_of_accounts MODIFY COLUMN subtype ENUM(
            'current_asset', 'fixed_asset', 'other_asset',
            'current_liability', 'long_term_liability',
            'equity',
            'revenue', 'other_income',
            'cogs',
            'operating_expense', 'other_expense',
            'cash', 'bank', 'receivable', 'inventory', 'prepaid', 'depreciation',
            'payable', 'tax_payable', 'accrued', 'deferred', 'long_term', 'loan',
            'capital', 'retained_earnings', 'drawings',
            'sales', 'service', 'other', 'interest', 'discount',
            'freight',
            'payroll', 'operating', 'professional', 'marketing', 'maintenance',
            'travel', 'bank_charges', 'bad_debt', 'compliance'
        ) NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original enum values
        DB::statement("ALTER TABLE chart_of_accounts MODIFY COLUMN subtype ENUM(
            'current_asset', 'fixed_asset', 'other_asset',
            'current_liability', 'long_term_liability',
            'equity',
            'revenue', 'other_income',
            'cogs',
            'operating_expense', 'other_expense'
        ) NULL");
    }
};
