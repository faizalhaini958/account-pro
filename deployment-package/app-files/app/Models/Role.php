<?php

namespace App\Models;

use App\Observers\RoleObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[ObservedBy([RoleObserver::class])]
class Role extends Model
{
    protected $guarded = ['id'];

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permission');
    }

    /**
     * Sync permissions with audit logging
     */
    public function syncPermissionsWithAudit(array $permissionIds): array
    {
        $oldPermissionIds = $this->permissions()->pluck('permissions.id')->toArray();

        $changes = $this->permissions()->sync($permissionIds);

        // Get permission names for logging
        $addedNames = Permission::whereIn('id', $changes['attached'])->pluck('name')->toArray();
        $removedNames = Permission::whereIn('id', $changes['detached'])->pluck('name')->toArray();

        if (!empty($addedNames) || !empty($removedNames)) {
            RoleObserver::logPermissionSync($this, $addedNames, $removedNames);

            // Clear permission cache for all users with this role
            $this->clearUsersPermissionCache();
        }

        return $changes;
    }

    /**
     * Clear permission cache for all users with this role
     */
    public function clearUsersPermissionCache(): void
    {
        // Get all tenant_user records with this role
        $tenantUsers = \DB::table('tenant_user')
            ->where('role_id', $this->id)
            ->get();

        foreach ($tenantUsers as $tenantUser) {
            \Cache::forget("user_permissions_{$tenantUser->user_id}_{$tenantUser->tenant_id}");
        }
    }
}
