<?php

namespace App\Services;

use App\Models\Tenant;

class TenantContext
{
    protected static ?Tenant $tenant = null;

    public static function setTenant(?Tenant $tenant): void
    {
        self::$tenant = $tenant;
    }

    /**
     * Alias for setTenant for convenience
     */
    public static function set(?Tenant $tenant): void
    {
        self::setTenant($tenant);
    }

    public static function getTenant(): ?Tenant
    {
        return self::$tenant;
    }

    public static function getTenantId(): ?int
    {
        return self::$tenant?->id;
    }

    /**
     * Alias for getTenantId for convenience
     */
    public static function getId(): ?int
    {
        return self::getTenantId();
    }

    public static function check(): bool
    {
        return !is_null(self::$tenant);
    }

    /**
     * Clear the tenant context
     */
    public static function clear(): void
    {
        self::$tenant = null;
    }
}
