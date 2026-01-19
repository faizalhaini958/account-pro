<?php

namespace App\Observers;

use App\Models\Permission;
use App\Models\AuditLog;
use App\Services\TenantContext;

class PermissionObserver
{
    /**
     * Handle the Permission "created" event.
     */
    public function created(Permission $permission): void
    {
        $this->logAudit($permission, 'created', null, $permission->toArray());
    }

    /**
     * Handle the Permission "updated" event.
     */
    public function updated(Permission $permission): void
    {
        $this->logAudit(
            $permission,
            'updated',
            $permission->getOriginal(),
            $permission->getChanges()
        );
    }

    /**
     * Handle the Permission "deleted" event.
     */
    public function deleted(Permission $permission): void
    {
        $this->logAudit($permission, 'deleted', $permission->toArray(), null);
    }

    /**
     * Log audit entry for permission changes
     */
    protected function logAudit(Permission $permission, string $event, ?array $oldValues, ?array $newValues): void
    {
        // Permissions are global, but log with current tenant context if available
        $tenantId = TenantContext::getId();

        if (!$tenantId) {
            // Skip audit logging if no tenant context
            return;
        }

        AuditLog::create([
            'tenant_id' => $tenantId,
            'user_id' => auth()->id(),
            'auditable_type' => Permission::class,
            'auditable_id' => $permission->id,
            'event' => $event,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
