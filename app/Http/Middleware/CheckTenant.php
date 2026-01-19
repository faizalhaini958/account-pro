<?php

namespace App\Http\Middleware;

use App\Services\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckTenant
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $user = auth()->user();

            // If user has a current tenant set
            if ($user->current_tenant_id) {
                $tenant = $user->currentTenant;
                if ($tenant) {
                     TenantContext::setTenant($tenant);
                }
            } 
            // If not, try to pick the first available one
            elseif ($user->tenants()->exists()) {
                $tenant = $user->tenants()->first();
                $user->update(['current_tenant_id' => $tenant->id]);
                TenantContext::setTenant($tenant);
            }
            // Logic for users with NO tenants would go here (e.g. redirect to onboarding)
        }

        return $next($request);
    }
}
