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
        Schema::table('customers', function (Blueprint $table) {
            // e-Invoice Required Fields - only add if they don't exist
            if (!Schema::hasColumn('customers', 'tin')) {
                $table->string('tin')->nullable()->comment('Tax Identification Number');
            }
            if (!Schema::hasColumn('customers', 'id_type')) {
                $table->enum('id_type', ['NRIC', 'Passport', 'BRN', 'ARMY'])->nullable();
            }
            if (!Schema::hasColumn('customers', 'id_number')) {
                $table->string('id_number')->nullable();
            }
            if (!Schema::hasColumn('customers', 'contact_number')) {
                $table->string('contact_number')->nullable();
            }
            if (!Schema::hasColumn('customers', 'address_line_1')) {
                $table->string('address_line_1')->nullable();
            }
            if (!Schema::hasColumn('customers', 'address_line_2')) {
                $table->string('address_line_2')->nullable();
            }
            if (!Schema::hasColumn('customers', 'address_line_3')) {
                $table->string('address_line_3')->nullable();
            }
            if (!Schema::hasColumn('customers', 'city')) {
                $table->string('city')->nullable();
            }
            if (!Schema::hasColumn('customers', 'state')) {
                $table->string('state')->nullable();
            }
            if (!Schema::hasColumn('customers', 'postcode')) {
                $table->string('postcode')->nullable();
            }
            if (!Schema::hasColumn('customers', 'country')) {
                $table->string('country')->default('MYS');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn([
                'tin', 'id_type', 'id_number', 'contact_number',
                'address_line_1', 'address_line_2', 'address_line_3',
                'city', 'state', 'postcode', 'country',
            ]);
        });
    }
};
