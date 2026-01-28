<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('einvoice_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('einvoice_document_id')->constrained()->cascadeOnDelete();
            $table->string('action'); // submit, validate, cancel, etc.
            $table->enum('status', ['success', 'failed']);
            $table->text('request_payload')->nullable();
            $table->text('response_payload')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('einvoice_logs');
    }
};
