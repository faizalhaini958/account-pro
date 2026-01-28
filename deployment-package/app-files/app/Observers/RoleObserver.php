<?php

namespace App\Observers;

use App\Models\Role;
use App\Models\AuditLog;
use App\Services\TenantContext;

class RoleObserver
{
    /**
     * Handle the Role "created" event.
     */
    public function created(Role $role): void
    {
        $this->logAudit('created', $role, null, $role->toArray());
    }

    /**
     * Handle the Role "updated" event.
     */
    public function updated(Role $role): void
    {
        $oldValues = $role->getOriginal();
        $newValues = $role->getChanges();

        // Don't log if only timestamps changed
        $significantChanges = array_diff_key($newValues, ['updated_at' => true, 'created_at' => true]);
        if (empty($significantChanges)) {
            return;
        }

        $this->logAudit('updated', $role, $oldValues, $newValues);
    }

    /**
     * Handle the Role "deleted" event.
     */
    public function deleted(Role $role): void
    {
        $this->logAudit('deleted', $role, $role->toArray(), null);
    }

    /**
     * Handle permission sync (when permissions are attached/detached)
     */
    public static function logPermissionSync(Role $role, array $oldPermissions, array $newPermissions): void
    {
        if ($oldPermissions === $newPermissions) {
            return;
        }

        AuditLog::create([
            'tenant_id' => TenantContext::getId(),
            'user_id' => auth()->id(),
            'auditable_type' => Role::class,
            'auditable_id' => $role->id,
            'event' => 'permissions_synced',
            'old_values' => ['permissions' => $oldPermissions],
            'new_values' => ['permissions' => $newPermissions],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Log audit entry
     */
    protected function logAudit(string $event, Role $role, ?array $oldValues, ?array $newValues): void
    {
        AuditLog::create([
            'tenant_id' => TenantContext::getId(),
            'user_id' => auth()->id(),
            'auditable_type' => Role::class,
            'auditable_id' => $role->id,
            'event' => $event,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
