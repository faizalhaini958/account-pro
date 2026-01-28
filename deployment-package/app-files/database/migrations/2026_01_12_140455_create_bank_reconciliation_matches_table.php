<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_reconciliation_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_statement_line_id')->constrained()->cascadeOnDelete();
            $table->string('transaction_type'); // Receipt, Payment, JournalEntry
            $table->unsignedBigInteger('transaction_id');
            $table->decimal('amount', 15, 2);
            $table->foreignId('matched_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            
            $table->index(['transaction_type', 'transaction_id'], 'brm_trans_type_id_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_reconciliation_matches');
    }
};
