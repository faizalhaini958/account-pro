<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'current_tenant' => $user ? $user->currentTenant : null,
                'tenants' => $user ? $user->tenants()->select('tenants.id', 'tenants.name')->get() : [],
                'role' => $user ? $user->getCurrentRole()?->only(['id', 'name', 'slug']) : null,
                'permissions' => $user ? $user->getPermissions() : [],
                'is_super_admin' => $user ? $user->isSuperAdmin() : false,
                'subscription' => $user ? $user->subscription : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
