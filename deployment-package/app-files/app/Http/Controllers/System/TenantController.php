<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Services\SubscriptionLimitService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TenantController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Get all tenants for the current user with their pivot data
        $tenants = $user->tenants()
            ->withPivot('role_id', 'is_active')
            ->with('users')
            ->get()
            ->map(function ($tenant) use ($user) {
                $role = \App\Models\Role::find($tenant->pivot->role_id);

                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'email' => $tenant->email,
                    'phone' => $tenant->phone,
                    'is_active' => $tenant->is_active,
                    'is_current' => $tenant->id === $user->current_tenant_id,
                    'role' => $role ? $role->name : 'Unknown',
                    'users_count' => $tenant->users->count(),
                    'created_at' => $tenant->created_at->format('d M Y'),
                ];
            });

        return inertia('System/Companies/Index', [
            'companies' => $tenants,
        ]);
    }

    public function edit(Tenant $company)
    {
        // Check if user has access to this tenant
        if (!request()->user()->tenants()->where('tenants.id', $company->id)->exists()) {
            abort(403, 'You do not have access to this company.');
        }

        // Get Chart of Accounts for GL mapping
        $coa_assets = \App\Models\ChartOfAccount::where('tenant_id', $company->id)
            ->where('type', 'asset')
            ->get(['id', 'code', 'name']);
        $coa_income = \App\Models\ChartOfAccount::where('tenant_id', $company->id)
            ->where('type', 'income')
            ->get(['id', 'code', 'name']);
        $coa_liabilities = \App\Models\ChartOfAccount::where('tenant_id', $company->id)
            ->where('type', 'liability')
            ->get(['id', 'code', 'name']);

        // Get GL settings from tenant settings
        $settings = $company->settings ?? [];
        $glSettings = $settings['gl'] ?? [];

        return inertia('System/Companies/Edit', [
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'slug' => $company->slug,
                'ssm_number' => $company->ssm_number,
                'sst_number' => $company->sst_number,
                'address' => $company->address,
                'address_1' => $company->address_1,
                'address_2' => $company->address_2,
                'city' => $company->city,
                'state' => $company->state,
                'postcode' => $company->postcode,
                'country' => $company->country,
                'phone' => $company->phone,
                'email' => $company->email,
                'website' => $company->website,
                'currency' => $company->currency,
                'timezone' => $company->timezone,
                'financial_year_start' => $company->financial_year_start?->format('Y-m-d'),
                'sst_enabled' => $company->sst_enabled,
                'sst_rate' => $company->sst_rate,
                'logo_url' => $company->logo_url,
                'logo_path' => $company->logo_path,
                'gl_settings' => [
                    'ar_account' => $glSettings['ar_account'] ?? '',
                    'sales_account' => $glSettings['sales_account'] ?? '',
                    'tax_account' => $glSettings['tax_account'] ?? '',
                ],
            ],
            'coa_assets' => $coa_assets,
            'coa_income' => $coa_income,
            'coa_liabilities' => $coa_liabilities,
        ]);
    }

    public function update(Request $request, Tenant $company)
    {
        // Check if user has access to this tenant
        if (!$request->user()->tenants()->where('tenants.id', $company->id)->exists()) {
            abort(403, 'You do not have access to this company.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'ssm_number' => 'nullable|string|max:50',
            'sst_number' => 'nullable|string|max:50',
            'address_1' => 'nullable|string|max:255',
            'address_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postcode' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:255',
            'logo' => 'nullable|image|max:2048', // Max 2MB
            'currency' => 'nullable|string|max:3',
            'timezone' => 'nullable|string|max:50',
            'financial_year_start' => 'nullable|date',
            'sst_enabled' => 'boolean',
            'sst_rate' => 'nullable|numeric|min:0|max:100',
            'gl_settings' => 'nullable|array',
            'gl_settings.ar_account' => 'nullable|string',
            'gl_settings.sales_account' => 'nullable|string',
            'gl_settings.tax_account' => 'nullable|string',
        ]);

        // Handle Logo Upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($company->logo_path && Storage::disk('public')->exists($company->logo_path)) {
                Storage::disk('public')->delete($company->logo_path);
            }

            // Store new logo
            $path = $request->file('logo')->store('logos', 'public');
            $company->logo_path = $path;
        }

        // Handle GL settings
        $settings = $company->settings ?? [];
        if (isset($validated['gl_settings'])) {
            $settings['gl'] = $validated['gl_settings'];
        }

        $company->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'ssm_number' => $validated['ssm_number'],
            'sst_number' => $validated['sst_number'],
            'address_1' => $validated['address_1'] ?? null,
            'address_2' => $validated['address_2'] ?? null,
            'city' => $validated['city'] ?? null,
            'state' => $validated['state'] ?? null,
            'postcode' => $validated['postcode'] ?? null,
            'country' => $validated['country'] ?? 'Malaysia',
            'website' => $validated['website'],
            'currency' => $validated['currency'] ?? 'MYR',
            'timezone' => $validated['timezone'] ?? 'Asia/Kuala_Lumpur',
            'financial_year_start' => $validated['financial_year_start'] ?? null,
            'sst_enabled' => $validated['sst_enabled'] ?? false,
            'sst_rate' => $validated['sst_rate'] ?? 6.00,
            'settings' => $settings,
        ]);

        return redirect()->route('companies.index')->with('success', 'Company updated successfully.');
    }

    public function destroy(Request $request, Tenant $company)
    {
        // Check if user has access to this tenant
        if (!$request->user()->tenants()->where('tenants.id', $company->id)->exists()) {
            abort(403, 'You do not have access to this company.');
        }

        // Prevent deleting the current active company
        if ($company->id === $request->user()->current_tenant_id) {
            return back()->withErrors(['error' => 'Cannot delete the currently active company. Please switch to another company first.']);
        }

        // Prevent deleting if it's the only company
        if ($request->user()->tenants()->count() <= 1) {
            return back()->withErrors(['error' => 'Cannot delete your only company.']);
        }

        $companyName = $company->name;
        $company->delete();

        return redirect()->route('companies.index')->with('success', "Company '{$companyName}' deleted successfully.");
    }

    public function store(Request $request)
    {
        // Check subscription limits
        $limitService = new SubscriptionLimitService();
        $limitCheck = $limitService->canCreateCompany($request->user());

        if (!$limitCheck['allowed']) {
            return back()->withErrors(['error' => $limitCheck['message']]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        $tenant = DB::transaction(function () use ($validated, $request) {
            // Generate unique slug from company name
            $baseSlug = Str::slug($validated['name']);
            $slug = $baseSlug;
            $counter = 1;

            while (Tenant::withTrashed()->where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }

            $tenant = Tenant::create([
                'name' => $validated['name'],
                'slug' => $slug,
                'email' => $validated['email'] ?? null,
                'is_active' => true,
            ]);

            // Attach current user as Owner (full access)
            $ownerRole = \App\Models\Role::where('slug', 'owner')->first();
            $roleId = $ownerRole ? $ownerRole->id : 1; // Fallback to ID 1 if Owner role not found

            $tenant->users()->attach($request->user()->id, [
                'role_id' => $roleId,
                'is_active' => true
            ]);

            return $tenant;
        });

        // Switch user to the new tenant
        $user = $request->user();
        $oldTenantId = $user->current_tenant_id;

        // Clear cached permissions for the old tenant context
        if ($oldTenantId) {
            \Cache::forget("user:{$user->id}:tenant:{$oldTenantId}:role");
            \Cache::forget("user:{$user->id}:tenant:{$oldTenantId}:permissions");
        }

        // Update to new tenant
        $user->update(['current_tenant_id' => $tenant->id]);

        return redirect()->route('dashboard')->with('success', 'Company created successfully. You are now working with ' . $tenant->name . '.');
    }
}
