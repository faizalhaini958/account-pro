<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('einvoice_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->string('uuid')->unique()->nullable(); // MyInvois UUID
            $table->enum('document_type', ['invoice', 'credit_note', 'debit_note', 'self_billed'])->default('invoice');
            $table->json('einvoice_data'); // Full e-Invoice JSON payload
            $table->enum('status', ['not_prepared', 'prepared', 'submitted', 'validated', 'rejected', 'cancelled'])->default('not_prepared');
            $table->text('validation_errors')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('validated_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('einvoice_documents');
    }
};
