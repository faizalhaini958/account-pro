<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    public function index()
    {
        $tenant = \App\Services\TenantContext::getTenant();

        if (!$tenant) {
            abort(403, 'No active tenant selected.');
        }

        return Inertia::render('Master/Settings/Index', [
            'tenant' => $tenant,
            'coa_assets' => \App\Models\ChartOfAccount::where('type', 'asset')->get(),
            'coa_income' => \App\Models\ChartOfAccount::where('type', 'income')->get(),
            'coa_liabilities' => \App\Models\ChartOfAccount::where('type', 'liability')->get(),
        ]);
    }

    public function update(Request $request)
    {
        $tenant = \App\Services\TenantContext::getTenant();

        if (!$tenant) {
            abort(403, 'No active tenant selected.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            // 'address' => 'nullable|string', // Removed simple address
            'address_1' => 'nullable|string|max:255',
            'address_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postcode' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:255',
            'logo' => 'nullable|image|max:2048', // Max 2MB
            'sst_number' => 'nullable|string|max:50',
            'sst_rate' => 'required|numeric|min:0|max:100',
            'is_sst_registered' => 'boolean',
            'sst_registration_number' => 'nullable|string|max:50',
            'gl_settings' => 'array', // Nested array for GL accounts
        ]);

        // Handle File Upload (Logo) - if implemented later
        // if ($request->hasFile('logo')) { ... }

        $settings = $tenant->settings ?? [];
        if (isset($validated['gl_settings'])) {
            $settings['gl'] = $validated['gl_settings'];
        }

        // Handle Logo Upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($tenant->logo_path && Storage::disk('public')->exists($tenant->logo_path)) {
                Storage::disk('public')->delete($tenant->logo_path);
            }
            
            // Store new logo
            $path = $request->file('logo')->store('logos', 'public');
            $tenant->logo_path = $path;
            $tenant->save(); // Save immediately or part of update below (but logo_path is separate column now)
        }

        $tenant->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'address_1' => $validated['address_1'] ?? null,
            'address_2' => $validated['address_2'] ?? null,
            'city' => $validated['city'] ?? null,
            'state' => $validated['state'] ?? null,
            'postcode' => $validated['postcode'] ?? null,
            'country' => $validated['country'] ?? 'Malaysia',
            // 'address' => $validated['address'],
            'website' => $validated['website'],
            'sst_number' => $validated['sst_number'],
            'sst_rate' => $validated['sst_rate'],
            'settings' => $settings,
        ]);

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}
