<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use App\Services\TenantContext;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        $plans = SubscriptionPlan::active()
            ->orderBy('price_monthly')
            ->get(['id', 'code', 'name', 'description', 'price_monthly', 'price_yearly', 'features']);

        return Inertia::render('Auth/Register', [
            'plans' => $plans,
            'selectedPlan' => $request->query('plan'),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'company_name' => 'nullable|string|max:255',
            'plan_code' => 'required|string|exists:subscription_plans,code',
            'billing_cycle' => 'required|string|in:monthly,yearly',
        ]);

        return DB::transaction(function () use ($request) {
            // Create the user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'status' => 'active',
            ]);

            // Get the selected plan
            $plan = SubscriptionPlan::where('code', $request->plan_code)->firstOrFail();

            // Create subscription for the user
            $price = $request->billing_cycle === 'monthly'
                ? $plan->price_monthly
                : $plan->price_yearly;

            $endsAt = $request->billing_cycle === 'monthly'
                ? now()->addMonth()
                : now()->addYear();

            // Only create paid subscription if plan is not free
            $subscription = null;
            if ($plan->price_monthly > 0 || $plan->price_yearly > 0) {
                $subscription = UserSubscription::create([
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'status' => 'active', // Start with active (trial logic handled by dates)
                    'billing_cycle' => $request->billing_cycle,
                    'price' => $price,
                    'starts_at' => now(),
                    'ends_at' => now()->addDays(14), // 14-day trial
                    'trial_ends_at' => now()->addDays(14),
                ]);
            } else {
                // Free plan - active immediately
                $subscription = UserSubscription::create([
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'status' => 'active',
                    'billing_cycle' => $request->billing_cycle,
                    'price' => 0,
                    'starts_at' => now(),
                    'ends_at' => null, // Free plans don't expire
                ]);
            }

            // Create a tenant (company) for the new user
            $companyName = $request->company_name ?: $request->name . "'s Company";
            $tenant = Tenant::create([
                'name' => $companyName,
                'slug' => Str::slug($companyName) . '-' . Str::random(6),
                'email' => $request->email,
                'is_active' => true,
                'currency' => 'MYR',
                'financial_year_start' => now()->startOfYear(),
            ]);

            // Get the Owner role (or Admin if Owner doesn't exist)
            $ownerRole = Role::where('slug', 'owner')->first()
                ?? Role::where('slug', 'admin')->first();

            // Attach user to tenant with Owner role
            $tenant->users()->attach($user->id, [
                'role_id' => $ownerRole?->id,
                'is_active' => true,
            ]);

            // Set user's current tenant
            $user->update(['current_tenant_id' => $tenant->id]);

            // Set the tenant context for the session
            TenantContext::set($tenant);

            event(new Registered($user));

            // Send trial notification if on a paid plan with trial
            if ($subscription && $subscription->trial_ends_at) {
                $user->notify(new \App\Notifications\TrialStartedNotification(
                    $subscription,
                    $plan
                ));
            }

            Auth::login($user);

            return redirect(route('dashboard', absolute: false));
        });
    }
}
