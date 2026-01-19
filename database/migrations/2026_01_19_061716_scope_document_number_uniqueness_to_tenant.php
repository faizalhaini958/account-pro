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
        $tables = ['invoices', 'quotations', 'receipts', 'delivery_orders', 'credit_notes'];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $tableInstance) use ($table) {
                // Drop the existing unique index on 'number'
                $tableInstance->dropUnique($table . '_number_unique');
                
                // Add new composite unique index on ['tenant_id', 'number']
                $tableInstance->unique(['tenant_id', 'number'], $table . '_tenant_id_number_unique');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = ['invoices', 'quotations', 'receipts', 'delivery_orders', 'credit_notes'];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $tableInstance) use ($table) {
                // Drop the composite unique index
                $tableInstance->dropUnique($table . '_tenant_id_number_unique');

                // Restore the global unique index on 'number'
                $tableInstance->unique('number', $table . '_number_unique');
            });
        }
    }
};
