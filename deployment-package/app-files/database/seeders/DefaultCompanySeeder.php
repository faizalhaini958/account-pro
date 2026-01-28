<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DefaultCompanySeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // Create Default Tenant
            $tenant = Tenant::firstOrCreate(['slug' => 'demo-company-sdn-bhd'], [
                'name' => 'Demo Company Sdn Bhd',
                'ssm_number' => '202401001234',
                'email' => 'admin@democompany.com',
                'country' => 'Malaysia',
                'currency' => 'MYR',
                'timezone' => 'Asia/Kuala_Lumpur',
                'financial_year_start' => now()->startOfYear(),
                'sst_enabled' => true,
                'sst_rate' => 0.06,
                'is_active' => true,
            ]);

            // Roles
            $ownerRole = Role::where('slug', 'owner')->first();
            $adminRole = Role::where('slug', 'admin')->first();
            $accountantRole = Role::where('slug', 'accountant')->first();

            // Create Owner User
            $owner = User::firstOrCreate(['email' => 'faizal@example.com'], [
                'name' => 'Faizal Haini',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'current_tenant_id' => $tenant->id,
            ]);
            
            if (!$tenant->users()->where('user_id', $owner->id)->exists()) {
                $tenant->users()->attach($owner->id, ['role_id' => $ownerRole?->id, 'is_active' => true]);
            }

            // Create Admin User
            $admin = User::firstOrCreate(['email' => 'admin@example.com'], [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'current_tenant_id' => $tenant->id,
                'is_super_admin' => true,
            ]);

            if (!$tenant->users()->where('user_id', $admin->id)->exists()) {
                $tenant->users()->attach($admin->id, ['role_id' => $adminRole?->id, 'is_active' => true]);
            }

            // Create Standard User (Accountant)
            $user = User::firstOrCreate(['email' => 'user@example.com'], [
                'name' => 'Standard User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'current_tenant_id' => $tenant->id,
            ]);

            if (!$tenant->users()->where('user_id', $user->id)->exists()) {
                $tenant->users()->attach($user->id, ['role_id' => $accountantRole?->id, 'is_active' => true]);
            }

            // Run COA Seeder for this tenant
            // Note: In a real app we might call the seeder class directly or use a service
            // Here we want to ensure the logic runs for this specific tenant we just created
            // Since the COA seeder picks the "first" tenant, and we just created one (assuming it's the first), it should work.
            // Better to explicitly call seed logic here if needed, but for now calling the class is fine if it handles the tenant.
            
            $this->call(ChartOfAccountSeeder::class);
        });
    }
}
