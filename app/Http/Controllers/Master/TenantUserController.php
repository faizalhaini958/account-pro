<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Services\TenantContext;
use App\Services\SubscriptionLimitService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TenantUserController extends Controller
{
    public function index()
    {
        // 1. Check Permission
        if (!auth()->user()->can('users.view')) {
            abort(403, 'Unauthorized action.');
        }

        $tenant = TenantContext::getTenant();

        $query = $tenant->users()->withPivot('role_id', 'is_active');

        // Hide Super Admins if current user is not Super Admin
        if (!auth()->user()->isSuperAdmin()) {
            $query->where('is_super_admin', false);
        }

        $users = $query->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role_id' => $user->pivot->role_id,
                    'is_active' => $user->pivot->is_active,
                    'role_name' => Role::find($user->pivot->role_id)?->name ?? 'Unknown',
                ];
            });

        return Inertia::render('Master/Users/Index', [
            'users' => $users,
            'roles' => Role::all(),
        ]);
    }

    public function create()
    {
        if (!auth()->user()->can('users.create')) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('Master/Users/Create', [
            'roles' => Role::where('slug', '!=', 'admin')->get(),
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('users.create')) {
            abort(403, 'Unauthorized action.');
        }

        $tenant = TenantContext::getTenant();

        // Check subscription limits
        $limitService = new SubscriptionLimitService();
        $owner = $limitService->getTenantOwner($tenant);

        if ($owner) {
            $limitCheck = $limitService->canAddUser($tenant, $owner);
            if (!$limitCheck['allowed']) {
                return back()->withErrors(['error' => $limitCheck['message']]);
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255', // Check if exists globally?
            'role_id' => 'required|exists:roles,id',
        ]);

        $role = Role::find($validated['role_id']);
        if ($role->slug === 'admin') {
             abort(403, 'Cannot assign Admin role.');
        }

        // Check if user exists globally
        $user = User::where('email', $validated['email'])->first();

        if ($user) {
            // Check if already in tenant
            if ($tenant->users()->where('user_id', $user->id)->exists()) {
                return back()->withErrors(['email' => 'User is already a member of this company.']);
            }
            // If user doesn't have a current tenant, set it to this one
            if (!$user->current_tenant_id) {
                $user->update(['current_tenant_id' => $tenant->id]);
            }
        } else {
            // Create new user (Pending invitation logic - for now create with dummy password)
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make(Str::random(16)), // Should send invite email
                'current_tenant_id' => $tenant->id,
            ]);
        }

        // Attach to tenant
        $tenant->users()->attach($user->id, [
            'role_id' => $validated['role_id'],
            'is_active' => true,
        ]);

        return redirect()->route('master.users.index')
            ->with('success', 'User added to company successfully.');
    }

    public function edit($userId)
    {
        if (!auth()->user()->can('users.edit')) {
            abort(403, 'Unauthorized action.');
        }

        $tenant = TenantContext::getTenant();
        $user = $tenant->users()->findOrFail($userId);

        return Inertia::render('Master/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role_id' => $user->pivot->role_id,
                'is_active' => $user->pivot->is_active,
            ],
            'roles' => Role::all(),
        ]);
    }

    public function update(Request $request, $userId)
    {
        if (!auth()->user()->can('users.edit')) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'is_active' => 'boolean',
        ]);

        $tenant = TenantContext::getTenant();

        // Security Check: Cannot edit Super Admin unless you are one
        $targetUser = User::findOrFail($userId);
        if ($targetUser->isSuperAdmin() && !auth()->user()->isSuperAdmin()) {
             abort(403, 'You cannot modify a Super Administrator.');
        }

        // Prevent removing last admin?
        // Logic omitted for brevity, but should be considered.

        $tenant->users()->updateExistingPivot($userId, [
            'role_id' => $validated['role_id'],
            'is_active' => $validated['is_active'],
        ]);

        return redirect()->route('master.users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy($userId)
    {
        if (!auth()->user()->can('users.delete')) {
            abort(403, 'Unauthorized action.');
        }

        $tenant = TenantContext::getTenant();

        $targetUser = User::findOrFail($userId);

        // Security Check: Cannot delete Super Admin unless you are one
        if ($targetUser->isSuperAdmin() && !auth()->user()->isSuperAdmin()) {
             abort(403, 'You cannot remove a Super Administrator.');
        }

        if (auth()->id() == $userId) {
            return back()->withErrors(['error' => 'You cannot remove yourself.']);
        }

        $tenant->users()->detach($userId);

        return redirect()->route('master.users.index')
            ->with('success', 'User removed from company.');
    }
}
