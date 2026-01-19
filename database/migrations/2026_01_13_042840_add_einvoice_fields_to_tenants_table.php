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
        Schema::table('tenants', function (Blueprint $table) {
            // MyInvois API Credentials
            $table->string('myinvois_client_id')->nullable();
            $table->string('myinvois_client_secret')->nullable();
            $table->boolean('myinvois_sandbox_mode')->default(true);
            
            // Company Registration Details
            $table->string('tin')->nullable()->comment('Tax Identification Number');
            $table->string('brn')->nullable()->comment('Business Registration Number');
            $table->string('sst_registration_number')->nullable();
            $table->boolean('is_sst_registered')->default(false);
            
            // e-Invoice Settings
            $table->boolean('einvoice_enabled')->default(false);
            $table->string('einvoice_classification')->nullable()->comment('Industry classification code');
            $table->json('einvoice_settings')->nullable()->comment('Additional e-Invoice settings');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'myinvois_client_id',
                'myinvois_client_secret',
                'myinvois_sandbox_mode',
                'tin',
                'brn',
                'sst_registration_number',
                'is_sst_registered',
                'einvoice_enabled',
                'einvoice_classification',
                'einvoice_settings',
            ]);
        });
    }
};
