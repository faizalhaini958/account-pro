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
            if (!Schema::hasColumn('tenants', 'address_1')) {
                $table->string('address_1')->nullable();
            }
            if (!Schema::hasColumn('tenants', 'address_2')) {
                $table->string('address_2')->nullable();
            }
            if (!Schema::hasColumn('tenants', 'logo_path')) {
                $table->string('logo_path')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            if (Schema::hasColumn('tenants', 'address_1')) {
                $table->dropColumn('address_1');
            }
            if (Schema::hasColumn('tenants', 'address_2')) {
                $table->dropColumn('address_2');
            }
            if (Schema::hasColumn('tenants', 'logo_path')) {
                $table->dropColumn('logo_path');
            }
        });
    }
};
