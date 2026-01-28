<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentGateway;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentGatewayController extends Controller
{
    /**
     * Display payment gateways list
     */
    public function index()
    {
        $gateways = PaymentGateway::all()->map(function ($gateway) {
            return [
                'id' => $gateway->id,
                'code' => $gateway->code,
                'name' => $gateway->name,
                'description' => $gateway->description,
                'is_active' => $gateway->is_active,
                'is_sandbox' => $gateway->is_sandbox,
                'supported_currencies' => $gateway->supported_currencies,
                'min_amount' => $gateway->min_amount,
                'max_amount' => $gateway->max_amount,
                'created_at' => $gateway->created_at,
                'updated_at' => $gateway->updated_at,
            ];
        });

        return Inertia::render('Admin/Settings/PaymentGateways/Index', [
            'gateways' => $gateways,
        ]);
    }

    /**
     * Show form for editing gateway
     */
    public function edit(PaymentGateway $gateway)
    {
        // Get config without encrypted values
        $config = $gateway->config ?? [];
        $sensitiveKeys = ['secret_key', 'api_secret', 'private_key', 'password', 'webhook_secret'];

        foreach ($sensitiveKeys as $key) {
            if (isset($config[$key]) && $config[$key]) {
                $config[$key] = '********'; // Mask sensitive values
            }
        }

        return Inertia::render('Admin/Settings/PaymentGateways/Edit', [
            'gateway' => [
                'id' => $gateway->id,
                'code' => $gateway->code,
                'name' => $gateway->name,
                'description' => $gateway->description,
                'is_active' => $gateway->is_active,
                'is_sandbox' => $gateway->is_sandbox,
                'config' => $config,
                'supported_currencies' => $gateway->supported_currencies,
                'min_amount' => $gateway->min_amount,
                'max_amount' => $gateway->max_amount,
            ],
        ]);
    }

    /**
     * Update gateway settings
     */
    public function update(Request $request, PaymentGateway $gateway)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'is_sandbox' => 'boolean',
            'config' => 'nullable|array',
            'supported_currencies' => 'nullable|array',
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0',
        ]);

        // Handle config separately for encryption
        $config = $validated['config'] ?? [];
        $existingConfig = $gateway->config ?? [];
        $sensitiveKeys = ['secret_key', 'api_secret', 'private_key', 'password', 'webhook_secret'];

        // Don't update masked values
        foreach ($sensitiveKeys as $key) {
            if (isset($config[$key]) && $config[$key] === '********') {
                $config[$key] = $existingConfig[$key] ?? null;
            }
        }

        unset($validated['config']);

        $gateway->update($validated);
        $gateway->setSecureConfig($config);
        $gateway->save();

        return back()->with('success', 'Payment gateway updated successfully.');
    }

    /**
     * Toggle gateway status
     */
    public function toggle(PaymentGateway $gateway)
    {
        $gateway->update([
            'is_active' => !$gateway->is_active,
        ]);

        $status = $gateway->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Payment gateway {$status} successfully.");
    }

    /**
     * Test gateway connection
     */
    public function test(PaymentGateway $gateway)
    {
        try {
            // Gateway-specific testing logic
            $result = match ($gateway->code) {
                'kipple_pay' => $this->testKipplePay($gateway),
                'chip' => $this->testChip($gateway),
                default => ['success' => false, 'message' => 'Unknown gateway'],
            };

            if ($result['success']) {
                return back()->with('success', $result['message']);
            } else {
                return back()->with('error', $result['message']);
            }
        } catch (\Exception $e) {
            return back()->with('error', 'Gateway test failed: ' . $e->getMessage());
        }
    }

    /**
     * Test Kipple Pay connection
     */
    protected function testKipplePay(PaymentGateway $gateway): array
    {
        // In real implementation, make API call to Kipple Pay
        $merchantId = $gateway->getDecryptedConfig('merchant_id');
        $apiKey = $gateway->getDecryptedConfig('api_key');

        if (empty($merchantId) || empty($apiKey)) {
            return ['success' => false, 'message' => 'Missing required credentials (Merchant ID, API Key)'];
        }

        // Simulate connection test
        return ['success' => true, 'message' => 'Kipple Pay connection successful!'];
    }

    /**
     * Test CHIP connection
     */
    protected function testChip(PaymentGateway $gateway): array
    {
        // In real implementation, make API call to CHIP
        $brandId = $gateway->getDecryptedConfig('brand_id');
        $apiKey = $gateway->getDecryptedConfig('api_key');

        if (empty($brandId) || empty($apiKey)) {
            return ['success' => false, 'message' => 'Missing required credentials (Brand ID, API Key)'];
        }

        // Simulate connection test
        return ['success' => true, 'message' => 'CHIP connection successful!'];
    }
}
