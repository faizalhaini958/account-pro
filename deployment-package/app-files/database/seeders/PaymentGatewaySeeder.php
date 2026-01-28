<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PaymentGateway;

class PaymentGatewaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Kipple Pay v1.6
        PaymentGateway::updateOrCreate(
            ['code' => 'kipple_pay'],
            [
                'name' => 'UiTM Kipple Pay v1.6',
                'description' => 'Malaysian e-wallet payment gateway for UiTM ecosystem. Supports FPX, E-Wallet, and Card payments.',
                'is_active' => false,
                'is_sandbox' => true,
                'config' => [
                    'merchant_id' => '',
                    'api_key' => '',
                    'secret_key' => '',
                    'callback_url' => '',
                    'redirect_url' => '',
                ],
                'supported_currencies' => ['MYR'],
                'min_amount' => 1.00,
                'max_amount' => 30000.00,
            ]
        );

        // CHIP Payment Gateway
        PaymentGateway::updateOrCreate(
            ['code' => 'chip'],
            [
                'name' => 'CHIP Payment Gateway',
                'description' => 'Modern payment infrastructure for Malaysian businesses. Supports FPX, Cards, E-Wallets, and BNPL.',
                'is_active' => false,
                'is_sandbox' => true,
                'config' => [
                    'brand_id' => '', // Required: Your CHIP Brand ID
                    'api_key' => '', // Required: Your CHIP API Key
                    'webhook_secret' => '', // Optional: Only if using webhooks (public key from CHIP dashboard)
                    'webhook_url' => '', // Optional: Your webhook endpoint URL
                ],
                'supported_currencies' => ['MYR', 'USD', 'SGD'],
                'min_amount' => 1.00,
                'max_amount' => null,
            ]
        );
    }
}
