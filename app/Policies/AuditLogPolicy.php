<?php

namespace App\Policies;

use App\Models\AuditLog;
use App\Models\User;

class AuditLogPolicy extends BasePolicy
{
    /**
     * Determine whether the user can view any audit logs.
     * Only admin users should be able to view audit logs.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('audit-log.view');
    }

    /**
     * Determine whether the user can view the audit log.
     */
    public function view(User $user, AuditLog $auditLog): bool
    {
        return $user->can('audit-log.view');
    }

    /**
     * Audit logs should never be created manually through the UI
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Audit logs should never be updated
     */
    public function update(User $user, AuditLog $auditLog): bool
    {
        return false;
    }

    /**
     * Only system admins can delete audit logs (for compliance cleanup)
     */
    public function delete(User $user, AuditLog $auditLog): bool
    {
        return $user->can('audit-log.delete');
    }

    /**
     * Determine whether the user can export audit logs.
     */
    public function export(User $user): bool
    {
        return $user->can('audit-log.export');
    }
}
