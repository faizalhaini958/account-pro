<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chart_of_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('code');
            $table->string('name');
            $table->enum('type', ['asset', 'liability', 'equity', 'income', 'cogs', 'expense']);
            $table->enum('subtype', [
                // Asset subtypes
                'current_asset', 'fixed_asset', 'other_asset',
                'cash', 'bank', 'receivable', 'inventory', 'prepaid', 'depreciation',
                // Liability subtypes
                'current_liability', 'long_term_liability',
                'payable', 'tax_payable', 'accrued', 'deferred', 'long_term', 'loan',
                // Equity subtypes
                'equity', 'capital', 'retained_earnings', 'drawings',
                // Income subtypes
                'revenue', 'other_income',
                'sales', 'service', 'other', 'interest', 'discount',
                // COGS subtypes
                'cogs', 'freight',
                // Expense subtypes
                'operating_expense', 'other_expense',
                'payroll', 'operating', 'professional', 'marketing', 'maintenance',
                'travel', 'bank_charges', 'bad_debt', 'compliance'
            ])->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('chart_of_accounts')->nullOnDelete();
            $table->text('description')->nullable();
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->enum('opening_balance_type', ['debit', 'credit'])->default('debit');
            $table->boolean('is_system')->default(false); // System accounts cannot be deleted
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // Unique constraint: code must be unique per tenant
            $table->unique(['tenant_id', 'code']);
            $table->index(['tenant_id', 'type']);
            $table->index(['tenant_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chart_of_accounts');
    }
};
