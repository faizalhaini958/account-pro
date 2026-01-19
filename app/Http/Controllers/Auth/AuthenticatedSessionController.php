<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();

        // Super admins go directly to admin panel
        if ($user->isSuperAdmin()) {
            return redirect()->intended(route('admin.dashboard', absolute: false));
        }

        // Auto-set current tenant if user has tenants but no current tenant set
        if (!$user->current_tenant_id) {
            $firstTenant = $user->tenants()->first();
            if ($firstTenant) {
                $user->update(['current_tenant_id' => $firstTenant->id]);
                TenantContext::set($firstTenant);
            }
        } else {
            // Set the tenant context for existing current tenant
            TenantContext::set($user->currentTenant);
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
