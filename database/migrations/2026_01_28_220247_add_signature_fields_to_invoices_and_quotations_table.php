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
        // Add signature fields to invoices table
        Schema::table('invoices', function (Blueprint $table) {
            $table->enum('signature_type', ['none', 'computer_generated', 'live'])->default('none')->after('terms');
            $table->text('signature_data')->nullable()->after('signature_type')->comment('Stores file path for computer-generated or base64 data for live signature');
            $table->string('signature_name')->nullable()->after('signature_data')->comment('Name of the person who signed');
            $table->timestamp('signed_at')->nullable()->after('signature_name');
        });

        // Add signature fields to quotations table
        Schema::table('quotations', function (Blueprint $table) {
            $table->enum('signature_type', ['none', 'computer_generated', 'live'])->default('none')->after('terms');
            $table->text('signature_data')->nullable()->after('signature_type')->comment('Stores file path for computer-generated or base64 data for live signature');
            $table->string('signature_name')->nullable()->after('signature_data')->comment('Name of the person who signed');
            $table->timestamp('signed_at')->nullable()->after('signature_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['signature_type', 'signature_data', 'signature_name', 'signed_at']);
        });

        Schema::table('quotations', function (Blueprint $table) {
            $table->dropColumn(['signature_type', 'signature_data', 'signature_name', 'signed_at']);
        });
    }
};
