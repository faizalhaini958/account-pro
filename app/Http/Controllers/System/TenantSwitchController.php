<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TenantSwitchController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
        ]);

        $user = $request->user();

        // Verify user belongs to this tenant
        if (!$user->tenants()->where('tenants.id', $validated['tenant_id'])->exists()) {
            abort(403, 'You do not have access to this company.');
        }

        $user->update([
            'current_tenant_id' => $validated['tenant_id']
        ]);

        return redirect()->route('dashboard')
            ->with('success', 'Switched company successfully.');
    }
}
