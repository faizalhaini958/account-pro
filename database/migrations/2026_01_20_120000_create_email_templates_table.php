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
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // e.g., 'verify-email', 'trial-started'
            $table->string('name'); // Display name
            $table->string('category'); // auth, subscription, invoice, einvoice
            $table->string('subject');
            $table->text('content'); // HTML content
            $table->json('variables')->nullable(); // Available variables for this template
            $table->text('description')->nullable(); // Help text for admin
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_templates');
    }
};
