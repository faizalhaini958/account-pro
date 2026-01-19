<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Cache;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'current_tenant_id',
        'is_super_admin',
        'status',
        'banned_at',
        'ban_reason',
        'banned_by',
        'last_login_at',
        'last_login_ip',
        'admin_notes',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_super_admin' => 'boolean',
        'banned_at' => 'datetime',
        'last_login_at' => 'datetime',
    ];

    public function tenants()
    {
        return $this->belongsToMany(Tenant::class)->withPivot('role_id', 'is_active');
    }

    public function currentTenant()
    {
        return $this->belongsTo(Tenant::class, 'current_tenant_id');
    }

    /**
     * Get cache key for user permissions in current tenant
     */
    protected function getPermissionCacheKey(): string
    {
        return "user:{$this->id}:tenant:{$this->current_tenant_id}:permissions";
    }

    /**
     * Get all permissions for current tenant context (cached)
     *
     * @return array<string>
     */
    public function getPermissions(): array
    {
        if (!$this->current_tenant_id) {
            return [];
        }

        return Cache::remember($this->getPermissionCacheKey(), now()->addMinutes(30), function () {
            $tenantUser = $this->tenants()
                ->where('tenant_id', $this->current_tenant_id)
                ->first();

            if (!$tenantUser || !$tenantUser->pivot->role_id) {
                return [];
            }

            $role = Role::with('permissions')->find($tenantUser->pivot->role_id);

            if (!$role) {
                return [];
            }

            return $role->permissions->pluck('slug')->toArray();
        });
    }

    /**
     * Get user's current role in tenant
     */
    public function getCurrentRole(): ?Role
    {
        if (!$this->current_tenant_id) {
            return null;
        }

        $cacheKey = "user:{$this->id}:tenant:{$this->current_tenant_id}:role";

        return Cache::remember($cacheKey, now()->addMinutes(30), function () {
            $tenantUser = $this->tenants()
                ->where('tenant_id', $this->current_tenant_id)
                ->first();

            if (!$tenantUser || !$tenantUser->pivot->role_id) {
                return null;
            }

            return Role::find($tenantUser->pivot->role_id);
        });
    }

    /**
     * Check if user has permission in current tenant context (uses cache)
     */
    public function hasPermission(string $permissionSlug): bool
    {
        return in_array($permissionSlug, $this->getPermissions());
    }

    /**
     * Check if user has any of the given permissions
     */
    public function hasAnyPermission(array $permissions): bool
    {
        $userPermissions = $this->getPermissions();

        foreach ($permissions as $permission) {
            if (in_array($permission, $userPermissions)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has all of the given permissions
     */
    public function hasAllPermissions(array $permissions): bool
    {
        $userPermissions = $this->getPermissions();

        foreach ($permissions as $permission) {
            if (!in_array($permission, $userPermissions)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Clear permission cache for this user
     */
    public function clearPermissionCache(): void
    {
        Cache::forget($this->getPermissionCacheKey());
        Cache::forget("user:{$this->id}:tenant:{$this->current_tenant_id}:role");
    }

    /**
     * Clear all permission caches when tenant changes
     */
    public static function bootClearsPermissionCache(): void
    {
        static::updated(function (User $user) {
            if ($user->isDirty('current_tenant_id')) {
                $user->clearPermissionCache();
            }
        });
    }

    public function isSuperAdmin(): bool
    {
        return $this->is_super_admin;
    }

    /**
     * Get the active subscription for this user
     */
    public function activeSubscription()
    {
        return $this->hasOne(UserSubscription::class)->active()->latest();
    }

    /**
     * Get all subscriptions for this user
     */
    public function subscriptions()
    {
        return $this->hasMany(UserSubscription::class);
    }

    /**
     * Get the latest subscription for this user
     */
    public function subscription()
    {
        return $this->hasOne(UserSubscription::class)->latestOfMany();
    }

    /**
     * Get payment transactions for this user
     */
    public function paymentTransactions()
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    /**
     * Check if user is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if user is banned
     */
    public function isBanned(): bool
    {
        return $this->status === 'banned' || $this->banned_at !== null;
    }

    /**
     * Ban the user
     */
    public function ban(string $reason, ?int $bannedById = null): void
    {
        $this->update([
            'status' => 'banned',
            'banned_at' => now(),
            'ban_reason' => $reason,
            'banned_by' => $bannedById,
        ]);
    }

    /**
     * Unban the user
     */
    public function unban(): void
    {
        $this->update([
            'status' => 'active',
            'banned_at' => null,
            'ban_reason' => null,
            'banned_by' => null,
        ]);
    }

    /**
     * Disable the user
     */
    public function disable(): void
    {
        $this->update(['status' => 'inactive']);
    }

    /**
     * Enable the user
     */
    public function enable(): void
    {
        $this->update(['status' => 'active']);
    }

    /**
     * Record login activity
     */
    public function recordLogin(?string $ipAddress = null): void
    {
        $this->update([
            'last_login_at' => now(),
            'last_login_ip' => $ipAddress,
        ]);
    }
}
