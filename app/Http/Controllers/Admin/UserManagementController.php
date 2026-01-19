<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Tenant;
use App\Models\UserSubscription;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    /**
     * Display users list
     */
    public function index(Request $request)
    {
        $query = User::with(['activeSubscription.plan', 'tenants'])
            ->withCount('tenants');

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Subscription filter
        if ($request->filled('subscription')) {
            if ($request->input('subscription') === 'active') {
                $query->whereHas('activeSubscription');
            } elseif ($request->input('subscription') === 'none') {
                $query->whereDoesntHave('activeSubscription');
            }
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => $user->status,
                    'is_super_admin' => $user->is_super_admin,
                    'email_verified_at' => $user->email_verified_at,
                    'last_login_at' => $user->last_login_at,
                    'last_login_ip' => $user->last_login_ip,
                    'banned_at' => $user->banned_at,
                    'ban_reason' => $user->ban_reason,
                    'tenants_count' => $user->tenants_count,
                    'subscription' => $user->activeSubscription ? [
                        'plan' => $user->activeSubscription->plan->name ?? 'Unknown',
                        'status' => $user->activeSubscription->status,
                        'ends_at' => $user->activeSubscription->ends_at,
                    ] : null,
                    'created_at' => $user->created_at,
                ];
            });

        $plans = SubscriptionPlan::active()->get(['id', 'code', 'name', 'price_monthly', 'price_yearly']);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'plans' => $plans,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', ''),
                'subscription' => $request->input('subscription', ''),
            ],
        ]);
    }

    /**
     * Show user details
     */
    public function show(User $user)
    {
        $user->load([
            'tenants',
            'subscriptions.plan',
            'paymentTransactions' => function ($q) {
                $q->orderBy('created_at', 'desc')->limit(10);
            },
        ]);

        return Inertia::render('Admin/Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'is_super_admin' => $user->is_super_admin,
                'email_verified_at' => $user->email_verified_at,
                'last_login_at' => $user->last_login_at,
                'last_login_ip' => $user->last_login_ip,
                'banned_at' => $user->banned_at,
                'ban_reason' => $user->ban_reason,
                'admin_notes' => $user->admin_notes,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'tenants' => $user->tenants->map(fn ($t) => [
                    'id' => $t->id,
                    'name' => $t->name,
                    'is_active' => $t->is_active,
                ]),
                'subscriptions' => $user->subscriptions->map(fn ($s) => [
                    'id' => $s->id,
                    'plan' => $s->plan->name ?? 'Unknown',
                    'status' => $s->status,
                    'billing_cycle' => $s->billing_cycle,
                    'starts_at' => $s->starts_at,
                    'ends_at' => $s->ends_at,
                    'cancelled_at' => $s->cancelled_at,
                ]),
                'recent_transactions' => $user->paymentTransactions->map(fn ($t) => [
                    'id' => $t->id,
                    'amount' => $t->amount,
                    'currency' => $t->currency,
                    'status' => $t->status,
                    'type' => $t->type,
                    'gateway_code' => $t->gateway_code,
                    'paid_at' => $t->paid_at,
                    'created_at' => $t->created_at,
                ]),
            ],
            'plans' => SubscriptionPlan::active()->get(['id', 'code', 'name', 'price_monthly', 'price_yearly']),
        ]);
    }

    /**
     * Show edit form
     */
    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'is_super_admin' => $user->is_super_admin,
                'admin_notes' => $user->admin_notes,
            ],
        ]);
    }

    /**
     * Update user
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'status' => 'required|in:active,inactive,banned,pending',
            'is_super_admin' => 'boolean',
            'admin_notes' => 'nullable|string|max:5000',
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return redirect()->route('admin.users.show', $user)
            ->with('success', 'User updated successfully.');
    }

    /**
     * Ban user
     */
    public function ban(Request $request, User $user)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        if ($user->is_super_admin) {
            return back()->with('error', 'Cannot ban a super admin.');
        }

        $user->ban($validated['reason'], auth()->id());

        return back()->with('success', 'User has been banned.');
    }

    /**
     * Unban user
     */
    public function unban(User $user)
    {
        $user->unban();

        return back()->with('success', 'User has been unbanned.');
    }

    /**
     * Toggle user status (enable/disable)
     */
    public function toggle(User $user)
    {
        if ($user->is_super_admin && auth()->id() !== $user->id) {
            return back()->with('error', 'Cannot modify another super admin.');
        }

        if ($user->status === 'active') {
            $user->disable();
            $message = 'User has been disabled.';
        } else {
            $user->enable();
            $message = 'User has been enabled.';
        }

        return back()->with('success', $message);
    }

    /**
     * Assign subscription to user
     */
    public function assignSubscription(Request $request, User $user)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
            'duration_months' => 'nullable|integer|min:1|max:60',
        ]);

        $plan = SubscriptionPlan::findOrFail($validated['plan_id']);
        $durationMonths = $validated['duration_months'] ?? ($validated['billing_cycle'] === 'yearly' ? 12 : 1);

        // Cancel existing active subscription
        $existingSubscription = $user->activeSubscription;
        if ($existingSubscription) {
            $existingSubscription->cancel();
        }

        // Create new subscription
        $subscription = UserSubscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'billing_cycle' => $validated['billing_cycle'],
            'starts_at' => now(),
            'ends_at' => now()->addMonths($durationMonths),
            'metadata' => [
                'assigned_by' => auth()->id(),
                'assigned_at' => now()->toIso8601String(),
                'type' => 'admin_assigned',
            ],
        ]);

        return back()->with('success', "Subscription ({$plan->name}) assigned to user successfully.");
    }

    /**
     * Cancel user's subscription
     */
    public function cancelSubscription(User $user)
    {
        $subscription = $user->activeSubscription;

        if (!$subscription) {
            return back()->with('error', 'User has no active subscription.');
        }

        $subscription->cancel();

        return back()->with('success', 'Subscription has been cancelled.');
    }

    /**
     * Impersonate user (login as user)
     */
    public function impersonate(User $user)
    {
        if ($user->is_super_admin) {
            return back()->with('error', 'Cannot impersonate a super admin.');
        }

        session()->put('impersonator_id', auth()->id());
        auth()->login($user);

        return redirect()->route('dashboard')
            ->with('success', "You are now logged in as {$user->name}.");
    }

    /**
     * Stop impersonating
     */
    public function stopImpersonating()
    {
        $impersonatorId = session()->pull('impersonator_id');

        if (!$impersonatorId) {
            return redirect()->route('dashboard');
        }

        $impersonator = User::find($impersonatorId);

        if ($impersonator) {
            auth()->login($impersonator);
            return redirect()->route('admin.users.index')
                ->with('success', 'Stopped impersonating user.');
        }

        return redirect()->route('dashboard');
    }
}
