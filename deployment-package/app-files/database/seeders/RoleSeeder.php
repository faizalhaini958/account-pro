<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'Owner', 'slug' => 'owner', 'description' => 'Business owner with full access'],
            ['name' => 'Admin', 'slug' => 'admin', 'description' => 'Administrator with system access'],
            ['name' => 'Accountant', 'slug' => 'accountant', 'description' => 'Full accounting access'],
            ['name' => 'Sales Clerk', 'slug' => 'sales_clerk', 'description' => 'Access to sales module only'],
            ['name' => 'Purchase Clerk', 'slug' => 'purchase_clerk', 'description' => 'Access to purchase module only'],
            ['name' => 'Viewer', 'slug' => 'viewer', 'description' => 'Read-only access to view data'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['slug' => $role['slug']], $role);
        }

        // Define permissions
        $modules = ['sales', 'purchases', 'accounting', 'inventory', 'reports', 'settings', 'users'];
        $actions = ['view', 'create', 'edit', 'delete', 'approve'];

        foreach ($modules as $module) {
            foreach ($actions as $action) {
                Permission::firstOrCreate([
                    'slug' => "{$module}.{$action}",
                ], [
                    'name' => ucwords("{$action} {$module}"),
                    'module' => $module,
                    'description' => "Can {$action} {$module}",
                ]);
            }
        }

        // Additional granular permissions
        $additionalPermissions = [
            ['slug' => 'einvoice.view', 'name' => 'View E-Invoice', 'module' => 'einvoice', 'description' => 'Can view e-invoices'],
            ['slug' => 'einvoice.submit', 'name' => 'Submit E-Invoice', 'module' => 'einvoice', 'description' => 'Can submit e-invoices to LHDN'],
            ['slug' => 'einvoice.cancel', 'name' => 'Cancel E-Invoice', 'module' => 'einvoice', 'description' => 'Can cancel e-invoices'],
            ['slug' => 'reports.export', 'name' => 'Export Reports', 'module' => 'reports', 'description' => 'Can export reports to PDF/Excel'],
            ['slug' => 'audit-log.view', 'name' => 'View Audit Logs', 'module' => 'audit-log', 'description' => 'Can view audit logs'],
            ['slug' => 'audit-log.export', 'name' => 'Export Audit Logs', 'module' => 'audit-log', 'description' => 'Can export audit logs'],
            ['slug' => 'audit-log.delete', 'name' => 'Delete Audit Logs', 'module' => 'audit-log', 'description' => 'Can delete audit logs'],
        ];

        foreach ($additionalPermissions as $permission) {
            Permission::firstOrCreate(['slug' => $permission['slug']], $permission);
        }

        // Assign permissions to roles
        $allPermissions = Permission::all();

        // Owner gets everything
        $ownerRole = Role::where('slug', 'owner')->first();
        if ($ownerRole) {
            $ownerRole->permissions()->sync($allPermissions);
        }

        // Admin gets everything except some sensitive approvals
        $adminRole = Role::where('slug', 'admin')->first();
        if ($adminRole) {
            $adminPermissions = $allPermissions->filter(function($permission) {
                // Admin gets all permissions (similar to owner in most cases)
                return true;
            });
            $adminRole->permissions()->sync($adminPermissions);
        }

        // Accountant gets accounting, sales, purchases, inventory, reports but NOT settings/users
        $accountantRole = Role::where('slug', 'accountant')->first();
        if ($accountantRole) {
            $accountantPermissions = $allPermissions->filter(function($permission) {
                $excludedModules = ['settings', 'users'];
                return !in_array($permission->module, $excludedModules);
            });
            $accountantRole->permissions()->sync($accountantPermissions);
        }

        // Sales Clerk - sales module view/create/edit, limited reports
        $salesClerkRole = Role::where('slug', 'sales_clerk')->first();
        if ($salesClerkRole) {
            $salesPermissions = $allPermissions->filter(function($permission) {
                // Sales module: view, create, edit (no delete, no approve)
                if ($permission->module === 'sales') {
                    return in_array(explode('.', $permission->slug)[1], ['view', 'create', 'edit']);
                }
                // Can view customers in inventory (for product selection)
                if ($permission->module === 'inventory') {
                    return $permission->slug === 'inventory.view';
                }
                // Can view sales-related reports only
                if ($permission->module === 'reports') {
                    return $permission->slug === 'reports.view';
                }
                return false;
            });
            $salesClerkRole->permissions()->sync($salesPermissions);
        }

        // Purchase Clerk - purchases module view/create/edit, limited reports
        $purchaseClerkRole = Role::where('slug', 'purchase_clerk')->first();
        if ($purchaseClerkRole) {
            $purchasePermissions = $allPermissions->filter(function($permission) {
                // Purchases module: view, create, edit (no delete, no approve)
                if ($permission->module === 'purchases') {
                    return in_array(explode('.', $permission->slug)[1], ['view', 'create', 'edit']);
                }
                // Can view products in inventory (for product selection)
                if ($permission->module === 'inventory') {
                    return $permission->slug === 'inventory.view';
                }
                // Can view reports
                if ($permission->module === 'reports') {
                    return $permission->slug === 'reports.view';
                }
                return false;
            });
            $purchaseClerkRole->permissions()->sync($purchasePermissions);
        }

        // Viewer - read-only access to all non-sensitive modules
        $viewerRole = Role::where('slug', 'viewer')->first();
        if ($viewerRole) {
            $viewerPermissions = $allPermissions->filter(function($permission) {
                $viewableModules = ['sales', 'purchases', 'accounting', 'inventory', 'reports'];
                return in_array($permission->module, $viewableModules) &&
                       str_ends_with($permission->slug, '.view');
            });
            $viewerRole->permissions()->sync($viewerPermissions);
        }
    }
}
