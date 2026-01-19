<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add admin management fields to users table
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('status', ['active', 'inactive', 'banned', 'pending'])->default('active')->after('password');
            $table->timestamp('banned_at')->nullable()->after('status');
            $table->text('ban_reason')->nullable()->after('banned_at');
            $table->foreignId('banned_by')->nullable()->constrained('users')->nullOnDelete()->after('ban_reason');
            $table->timestamp('last_login_at')->nullable()->after('banned_by');
            $table->string('last_login_ip', 45)->nullable()->after('last_login_at');
            $table->text('admin_notes')->nullable()->after('last_login_ip');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['banned_by']);
            $table->dropColumn([
                'status',
                'banned_at',
                'ban_reason',
                'banned_by',
                'last_login_at',
                'last_login_ip',
                'admin_notes',
            ]);
        });
    }
};
