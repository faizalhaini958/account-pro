<?php

namespace App\Traits;

use App\Models\AuditLog;
use App\Services\TenantContext;

/**
 * Automatically log all model changes to audit_logs table
 *
 * Usage: Add `use Auditable;` to your model
 *
 * Optionally customize:
 * - protected $auditExclude = ['password', 'remember_token']; // Fields to exclude from audit
 * - protected $auditIncludeOnly = ['status', 'amount']; // Only audit these fields
 */
trait Auditable
{
    /**
     * Boot the Auditable trait
     */
    public static function bootAuditable(): void
    {
        static::created(function ($model) {
            $model->logAuditEvent('created', null, $model->getAuditableAttributes());
        });

        static::updated(function ($model) {
            $changes = $model->getAuditableChanges();
            if (!empty($changes['old']) || !empty($changes['new'])) {
                $model->logAuditEvent('updated', $changes['old'], $changes['new']);
            }
        });

        static::deleted(function ($model) {
            $model->logAuditEvent('deleted', $model->getAuditableAttributes(), null);
        });

        // Handle soft deletes if the model uses SoftDeletes
        if (method_exists(static::class, 'restoring')) {
            static::restored(function ($model) {
                $model->logAuditEvent('restored', null, $model->getAuditableAttributes());
            });
        }
    }

    /**
     * Log an audit event
     */
    protected function logAuditEvent(string $event, ?array $oldValues, ?array $newValues): void
    {
        // Get tenant ID from model or context
        $tenantId = $this->tenant_id ?? TenantContext::getId();

        if (!$tenantId) {
            // Skip audit logging if no tenant context
            return;
        }

        AuditLog::create([
            'tenant_id' => $tenantId,
            'user_id' => auth()->id(),
            'model_type' => static::class,
            'model_id' => $this->getKey(),
            'action' => $event,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Get attributes that should be audited
     */
    protected function getAuditableAttributes(): array
    {
        $attributes = $this->attributesToArray();

        // Remove excluded fields
        $excluded = $this->getAuditExcludedFields();
        foreach ($excluded as $field) {
            unset($attributes[$field]);
        }

        // If includeOnly is set, only include those fields
        $includeOnly = $this->getAuditIncludeOnlyFields();
        if (!empty($includeOnly)) {
            $attributes = array_intersect_key($attributes, array_flip($includeOnly));
        }

        return $attributes;
    }

    /**
     * Get changes that should be audited
     */
    protected function getAuditableChanges(): array
    {
        $excluded = $this->getAuditExcludedFields();
        $includeOnly = $this->getAuditIncludeOnlyFields();

        $dirty = $this->getDirty();
        $original = $this->getOriginal();

        $oldValues = [];
        $newValues = [];

        foreach ($dirty as $key => $newValue) {
            // Skip excluded fields
            if (in_array($key, $excluded)) {
                continue;
            }

            // If includeOnly is set, skip fields not in the list
            if (!empty($includeOnly) && !in_array($key, $includeOnly)) {
                continue;
            }

            $oldValues[$key] = $original[$key] ?? null;
            $newValues[$key] = $newValue;
        }

        return [
            'old' => $oldValues,
            'new' => $newValues,
        ];
    }

    /**
     * Get fields that should be excluded from audit
     */
    protected function getAuditExcludedFields(): array
    {
        $default = ['password', 'remember_token', 'created_at', 'updated_at'];

        return property_exists($this, 'auditExclude')
            ? array_merge($default, $this->auditExclude)
            : $default;
    }

    /**
     * Get fields that should only be included in audit
     */
    protected function getAuditIncludeOnlyFields(): array
    {
        return property_exists($this, 'auditIncludeOnly')
            ? $this->auditIncludeOnly
            : [];
    }

    /**
     * Manually log a custom audit event
     */
    public function logCustomAudit(string $event, ?array $oldValues = null, ?array $newValues = null): void
    {
        $this->logAuditEvent($event, $oldValues, $newValues);
    }
}
