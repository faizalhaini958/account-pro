<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('type'); // purchase, sale, adjustment_in, adjustment_out, opening_balance
            $table->decimal('quantity', 15, 2); // Positive for in, negative for out
            $table->decimal('unit_cost', 15, 2);
            $table->decimal('total_cost', 15, 2);
            $table->decimal('balance_quantity', 15, 2)->default(0); // For FIFO tracking
            $table->string('reference')->nullable(); // Invoice number, adjustment ref, etc.
            $table->date('date');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['product_id', 'date']);
            $table->index(['tenant_id', 'product_id']);
            $table->index(['type', 'balance_quantity']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
