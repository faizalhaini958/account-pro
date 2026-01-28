<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionPlanController extends Controller
{
    /**
     * Display subscription plans list
     */
    public function index()
    {
        $plans = SubscriptionPlan::withCount(['subscriptions as active_subscriptions_count' => function ($q) {
            $q->where('status', 'active');
        }])
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Admin/SubscriptionPlans/Index', [
            'plans' => $plans->map(fn ($plan) => [
                'id' => $plan->id,
                'code' => $plan->code,
                'name' => $plan->name,
                'description' => $plan->description,
                'price_monthly' => $plan->price_monthly,
                'price_yearly' => $plan->price_yearly,
                'max_tenants' => $plan->max_tenants,
                'max_users_per_tenant' => $plan->max_users_per_tenant,
                'max_invoices_per_month' => $plan->max_invoices_per_month,
                'features' => $plan->features,
                'is_active' => $plan->is_active,
                'sort_order' => $plan->sort_order,
                'active_subscriptions_count' => $plan->active_subscriptions_count,
            ]),
        ]);
    }

    /**
     * Show create form
     */
    public function create()
    {
        return Inertia::render('Admin/SubscriptionPlans/Create');
    }

    /**
     * Store new plan
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:subscription_plans,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'price_monthly' => 'required|numeric|min:0',
            'price_yearly' => 'required|numeric|min:0',
            'max_tenants' => 'required|integer|min:1',
            'max_users_per_tenant' => 'required|integer|min:1',
            'max_invoices_per_month' => 'nullable|integer|min:1',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        SubscriptionPlan::create($validated);

        return redirect()->route('admin.subscription-plans.index')
            ->with('success', 'Subscription plan created successfully.');
    }

    /**
     * Show edit form
     */
    public function edit(SubscriptionPlan $subscriptionPlan)
    {
        return Inertia::render('Admin/SubscriptionPlans/Edit', [
            'plan' => [
                'id' => $subscriptionPlan->id,
                'code' => $subscriptionPlan->code,
                'name' => $subscriptionPlan->name,
                'description' => $subscriptionPlan->description,
                'price_monthly' => $subscriptionPlan->price_monthly,
                'price_yearly' => $subscriptionPlan->price_yearly,
                'max_tenants' => $subscriptionPlan->max_tenants,
                'max_users_per_tenant' => $subscriptionPlan->max_users_per_tenant,
                'max_invoices_per_month' => $subscriptionPlan->max_invoices_per_month,
                'features' => $subscriptionPlan->features,
                'is_active' => $subscriptionPlan->is_active,
                'sort_order' => $subscriptionPlan->sort_order,
            ],
        ]);
    }

    /**
     * Update plan
     */
    public function update(Request $request, SubscriptionPlan $subscriptionPlan)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:subscription_plans,code,' . $subscriptionPlan->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'price_monthly' => 'required|numeric|min:0',
            'price_yearly' => 'required|numeric|min:0',
            'max_tenants' => 'required|integer|min:1',
            'max_users_per_tenant' => 'required|integer|min:1',
            'max_invoices_per_month' => 'nullable|integer|min:1',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $subscriptionPlan->update($validated);

        return redirect()->route('admin.subscription-plans.index')
            ->with('success', 'Subscription plan updated successfully.');
    }

    /**
     * Toggle plan status
     */
    public function toggle(SubscriptionPlan $subscriptionPlan)
    {
        $subscriptionPlan->update([
            'is_active' => !$subscriptionPlan->is_active,
        ]);

        $status = $subscriptionPlan->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Plan {$status} successfully.");
    }

    /**
     * Delete plan
     */
    public function destroy(SubscriptionPlan $subscriptionPlan)
    {
        // Check if plan has active subscriptions
        if ($subscriptionPlan->subscriptions()->where('status', 'active')->exists()) {
            return back()->with('error', 'Cannot delete plan with active subscriptions.');
        }

        $subscriptionPlan->delete();

        return redirect()->route('admin.subscription-plans.index')
            ->with('success', 'Subscription plan deleted successfully.');
    }
}
