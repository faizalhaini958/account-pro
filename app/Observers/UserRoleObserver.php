<?php

namespace App\Observers;

use App\Models\User;
use App\Models\AuditLog;
use App\Services\TenantContext;

class UserRoleObserver
{
    /**
     * Log when a user's role is changed within a tenant
     */
    public static function logRoleChange(User $user, int $tenantId, ?int $oldRoleId, ?int $newRoleId, ?string $reason = null): void
    {
        if ($oldRoleId === $newRoleId) {
            return;
        }

        $oldRole = $oldRoleId ? \App\Models\Role::find($oldRoleId)?->name : null;
        $newRole = $newRoleId ? \App\Models\Role::find($newRoleId)?->name : null;

        AuditLog::create([
            'tenant_id' => $tenantId,
            'user_id' => auth()->id(),
            'auditable_type' => User::class,
            'auditable_id' => $user->id,
            'event' => 'role_changed',
            'old_values' => [
                'role_id' => $oldRoleId,
                'role_name' => $oldRole,
            ],
            'new_values' => [
                'role_id' => $newRoleId,
                'role_name' => $newRole,
                'reason' => $reason,
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        // Clear user permission cache when role changes
        $user->clearPermissionCache();
    }

    /**
     * Log when a user is added to a tenant
     */
    public static function logUserAdded(User $user, int $tenantId, ?int $roleId): void
    {
        $role = $roleId ? \App\Models\Role::find($roleId)?->name : null;

        AuditLog::create([
            'tenant_id' => $tenantId,
            'user_id' => auth()->id(),
            'auditable_type' => User::class,
            'auditable_id' => $user->id,
            'event' => 'added_to_tenant',
            'old_values' => null,
            'new_values' => [
                'role_id' => $roleId,
                'role_name' => $role,
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Log when a user is removed from a tenant
     */
    public static function logUserRemoved(User $user, int $tenantId): void
    {
        AuditLog::create([
            'tenant_id' => $tenantId,
            'user_id' => auth()->id(),
            'auditable_type' => User::class,
            'auditable_id' => $user->id,
            'event' => 'removed_from_tenant',
            'old_values' => ['user_email' => $user->email],
            'new_values' => null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Log when user permissions are directly modified (bypassing role)
     */
    public static function logDirectPermissionChange(User $user, array $addedPermissions, array $removedPermissions): void
    {
        if (empty($addedPermissions) && empty($removedPermissions)) {
            return;
        }

        AuditLog::create([
            'tenant_id' => TenantContext::getId(),
            'user_id' => auth()->id(),
            'auditable_type' => User::class,
            'auditable_id' => $user->id,
            'event' => 'permissions_modified',
            'old_values' => ['removed' => $removedPermissions],
            'new_values' => ['added' => $addedPermissions],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
