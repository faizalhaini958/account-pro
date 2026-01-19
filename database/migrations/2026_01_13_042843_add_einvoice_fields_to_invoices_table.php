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
        Schema::table('invoices', function (Blueprint $table) {
            // Link to e-Invoice document
            $table->foreignId('einvoice_document_id')->nullable()->constrained('einvoice_documents')->nullOnDelete();
            $table->string('einvoice_uuid')->nullable()->comment('MyInvois UUID');
            $table->text('einvoice_qr_code')->nullable()->comment('QR Code for e-Invoice');
            $table->timestamp('einvoice_submitted_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['einvoice_document_id']);
            $table->dropColumn(['einvoice_document_id', 'einvoice_uuid', 'einvoice_qr_code', 'einvoice_submitted_at']);
        });
    }
};
