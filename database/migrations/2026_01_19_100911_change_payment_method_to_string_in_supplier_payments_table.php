<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('supplier_payments', function (Blueprint $table) {
            $table->string('payment_method')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('supplier_payments', function (Blueprint $table) {
            // We can't easily revert to enum with data validation, but we can try setting it back to enum
            // However, since we might have new values, it's safer to leave as string or we'd lose data.
            // For strict reversal:
            // $table->enum('payment_method', ['cash', 'bank_transfer', 'cheque'])->default('bank_transfer')->change();
        });
    }
};
