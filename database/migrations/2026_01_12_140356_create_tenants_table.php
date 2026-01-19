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
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('ssm_number')->nullable();
            $table->string('sst_number')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postcode')->nullable();
            $table->string('country')->default('Malaysia');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('currency')->default('MYR');
            $table->date('financial_year_start')->nullable();
            $table->string('timezone')->default('Asia/Kuala_Lumpur');
            $table->boolean('sst_enabled')->default(false);
            $table->decimal('sst_rate', 5, 2)->default(6.00);
            $table->json('einvoice_config')->nullable(); // MyInvois API credentials, etc.
            $table->json('settings')->nullable(); // Additional settings
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
