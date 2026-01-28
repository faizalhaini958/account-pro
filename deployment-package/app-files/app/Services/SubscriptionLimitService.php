<?php

namespace App\Services;

use App\Models\User;
use App\Models\Tenant;
use App\Models\Invoice;
use Carbon\Carbon;

class SubscriptionLimitService
{
    /**
     * Check if user can create a new company
     *
     * @param User $user
     * @return array ['allowed' => bool, 'message' => string, 'current' => int, 'limit' => int]
     */
    public function canCreateCompany(User $user): array
    {
        $subscription = $user->activeSubscription;

        if (!$subscription || !$subscription->plan) {
            return [
                'allowed' => false,
                'message' => 'No active subscription found. Please subscribe to a plan to create companies.',
                'current' => 0,
                'limit' => 0,
            ];
        }

        $plan = $subscription->plan;
        $currentCount = $user->tenants()->count();
        $limit = $plan->max_tenants;

        if ($currentCount >= $limit) {
            return [
                'allowed' => false,
                'message' => "You have reached the maximum number of companies ({$limit}) allowed in your {$plan->name} plan. Please upgrade to create more companies.",
                'current' => $currentCount,
                'limit' => $limit,
            ];
        }

        return [
            'allowed' => true,
            'message' => 'You can create a new company.',
            'current' => $currentCount,
            'limit' => $limit,
        ];
    }

    /**
     * Check if a tenant can add a new user
     *
     * @param Tenant $tenant
     * @param User $owner User who owns the tenant (to check their subscription)
     * @return array ['allowed' => bool, 'message' => string, 'current' => int, 'limit' => int]
     */
    public function canAddUser(Tenant $tenant, User $owner): array
    {
        $subscription = $owner->activeSubscription;

        if (!$subscription || !$subscription->plan) {
            return [
                'allowed' => false,
                'message' => 'No active subscription found. Please subscribe to a plan to add users.',
                'current' => 0,
                'limit' => 0,
            ];
        }

        $plan = $subscription->plan;
        $currentCount = $tenant->users()->count();
        $limit = $plan->max_users_per_tenant;

        if ($currentCount >= $limit) {
            return [
                'allowed' => false,
                'message' => "You have reached the maximum number of users ({$limit}) per company allowed in your {$plan->name} plan. Please upgrade to add more users.",
                'current' => $currentCount,
                'limit' => $limit,
            ];
        }

        return [
            'allowed' => true,
            'message' => 'You can add a new user.',
            'current' => $currentCount,
            'limit' => $limit,
        ];
    }

    /**
     * Check if a tenant can create a new invoice this month
     *
     * @param Tenant $tenant
     * @param User $owner User who owns the tenant (to check their subscription)
     * @return array ['allowed' => bool, 'message' => string, 'current' => int, 'limit' => int|null]
     */
    public function canCreateInvoice(Tenant $tenant, User $owner): array
    {
        $subscription = $owner->activeSubscription;

        if (!$subscription || !$subscription->plan) {
            return [
                'allowed' => false,
                'message' => 'No active subscription found. Please subscribe to a plan to create invoices.',
                'current' => 0,
                'limit' => 0,
            ];
        }

        $plan = $subscription->plan;
        $limit = $plan->max_invoices_per_month;

        // If limit is null, it means unlimited
        if ($limit === null) {
            return [
                'allowed' => true,
                'message' => 'You have unlimited invoices.',
                'current' => 0,
                'limit' => null,
            ];
        }

        // Count invoices created this month
        $currentCount = Invoice::where('tenant_id', $tenant->id)
            ->whereYear('created_at', Carbon::now()->year)
            ->whereMonth('created_at', Carbon::now()->month)
            ->count();

        if ($currentCount >= $limit) {
            return [
                'allowed' => false,
                'message' => "You have reached the maximum number of invoices ({$limit}) per month allowed in your {$plan->name} plan. Please upgrade to create more invoices.",
                'current' => $currentCount,
                'limit' => $limit,
            ];
        }

        return [
            'allowed' => true,
            'message' => 'You can create a new invoice.',
            'current' => $currentCount,
            'limit' => $limit,
        ];
    }

    /**
     * Get the owner of a tenant (first user with owner role or first user)
     *
     * @param Tenant $tenant
     * @return User|null
     */
    public function getTenantOwner(Tenant $tenant): ?User
    {
        // Try to find user with owner role
        $ownerRole = \App\Models\Role::where('slug', 'owner')->first();

        if ($ownerRole) {
            $owner = $tenant->users()
                ->wherePivot('role_id', $ownerRole->id)
                ->first();

            if ($owner) {
                return $owner;
            }
        }

        // Fallback: return the first user
        return $tenant->users()->first();
    }
}
