<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_numbering', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('document_type'); // Invoice, Quotation, Receipt, etc.
            $table->string('prefix')->nullable(); // INV, QUO, RCPT, etc.
            $table->integer('next_number')->default(1);
            $table->integer('padding')->default(4); // Number of digits (e.g., 0001)
            $table->string('format')->default('{prefix}-{year}-{number}'); // Template
            $table->timestamps();
            
            $table->unique(['tenant_id', 'document_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_numbering');
    }
};
