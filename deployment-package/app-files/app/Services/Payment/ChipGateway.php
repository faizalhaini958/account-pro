<?php

namespace App\Services\Payment;

use App\Models\PaymentGateway;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * CHIP Payment Gateway Integration
 *
 * Documentation: https://github.com/CHIPAsia/chip-php-sdk
 * API Docs: https://developer.chip-in.asia/api
 *
 * Required Configuration:
 * - brand_id: Your CHIP Brand ID (required)
 * - api_key: Your CHIP API Key (required)
 * - webhook_secret: Public key for webhook signature verification (optional, for webhooks)
 *
 * Note: For basic payment processing, only brand_id and api_key are required.
 * The webhook_secret is only needed if you're using webhooks for payment notifications.
 */
class ChipGateway implements PaymentGatewayInterface
{
    protected PaymentGateway $gatewayModel;
    protected string $brandId;
    protected string $apiKey;
    protected ?string $webhookSecret;
    protected string $baseUrl;

    public function __construct(PaymentGateway $gatewayModel)
    {
        $this->gatewayModel = $gatewayModel;
        $this->brandId = $gatewayModel->getDecryptedConfig('brand_id');
        $this->apiKey = $gatewayModel->getDecryptedConfig('api_key');
        $this->webhookSecret = $gatewayModel->getDecryptedConfig('webhook_secret');

        // CHIP uses the same API endpoint for both sandbox and production
        // The environment is determined by the Brand ID and API Key you use
        $this->baseUrl = 'https://gate.chip-in.asia/api/v1';
    }

    public function createPayment(User $user, float $amount, string $currency, array $metadata = []): array
    {
        $reference = 'ORD-' . time() . '-' . uniqid();

        // Convert to cents
        $amountCents = (int) round($amount * 100);

        try {
            // Generate callback URLs
            // CHIP doesn't allow custom ports (only 80/443)
            // For local development, you need to use ngrok or similar tunneling service
            $successCallback = route('checkout.callback', ['gateway' => 'chip']);
            $failureCallback = route('checkout.callback', ['gateway' => 'chip']);
            $cancelCallback = route('checkout.index');

            // Redirect URLs - where the user is redirected after payment
            $successRedirect = route('subscription.payment.success');
            $failureRedirect = route('subscription.payment.failed');

            // If in local development without proper domain, log warning
            if (app()->environment('local') && (str_contains($successCallback, ':8000') || str_contains($successCallback, 'localhost'))) {
                Log::warning('CHIP Payment: Using local callback URLs. CHIP requires public URLs without custom ports. Use ngrok or skip callbacks in sandbox mode.');

                // For sandbox testing, you can optionally skip callbacks
                // CHIP will still work but won't redirect back automatically
                // Include redirect URLs for user experience
                $payloadData = [
                    'brand_id' => $this->brandId,
                    'client' => [
                        'email' => $user->email,
                        'phone' => $user->phone ?? '000000000',
                        'full_name' => $user->name,
                    ],
                    'purchase' => [
                        'currency' => $currency,
                        'products' => [
                            [
                                'name' => 'Subscription Plan',
                                'price' => $amountCents,
                                'quantity' => 1,
                            ]
                        ],
                    ],
                    'reference' => $reference,
                    // Add redirect URLs for user to be redirected after payment
                    'success_redirect' => $successRedirect,
                    'failure_redirect' => $failureRedirect,
                ];
            } else {
                $payloadData = [
                    'brand_id' => $this->brandId,
                    'client' => [
                        'email' => $user->email,
                        'phone' => $user->phone ?? '000000000',
                        'full_name' => $user->name,
                    ],
                    'purchase' => [
                        'currency' => $currency,
                        'products' => [
                            [
                                'name' => 'Subscription Plan',
                                'price' => $amountCents,
                                'quantity' => 1,
                            ]
                        ],
                    ],
                    'reference' => $reference,
                    'success_callback' => $successCallback,
                    'failure_callback' => $failureCallback,
                    'cancel_callback' => $cancelCallback,
                    // Add redirect URLs for user to be redirected after payment
                    'success_redirect' => $successRedirect,
                    'failure_redirect' => $failureRedirect,
                ];
            }

            $response = Http::withToken($this->apiKey)
                ->post("{$this->baseUrl}/purchases/", $payloadData);

            if ($response->successful()) {
                $data = $response->json();

                // Return URL and Transaction ID if possible
                return [
                    'redirect_url' => $data['checkout_url'],
                    'transaction_id' => $data['id'],
                    'metadata' => $data,
                ];
            }

            Log::error('Chip Payment Error: ' . $response->body());
            throw new \Exception('Failed to initiate payment with Chip.');

        } catch (\Exception $e) {
            Log::error('Chip Payment Exception: ' . $e->getMessage());
            throw $e;
        }
    }

    public function handleCallback(Request $request): Transaction
    {
        // Verify webhook signature if webhook_secret is configured
        if ($this->webhookSecret) {
            $this->verifyWebhookSignature($request);
        }

        $id = $request->input('id');

        if (!$id) {
            throw new \Exception('Invalid callback data: Missing purchase ID');
        }

        // Verify payment status with CHIP API to ensure authenticity
        $response = Http::withToken($this->apiKey)
            ->get("{$this->baseUrl}/purchases/{$id}/");

        if (!$response->successful()) {
             Log::error('CHIP: Failed to verify transaction', [
                'purchase_id' => $id,
                'response' => $response->body()
             ]);
             throw new \Exception('Failed to verify transaction with CHIP');
        }

        $data = $response->json();
        $status = $this->mapStatus($data['status']);

        // Return transaction data (will be saved by the caller)
        return new Transaction([
            'transaction_id' => $data['id'],
            'status' => $status,
            'amount' => $data['payment']['amount'] / 100, // Convert from cents
            'currency' => $data['purchase']['currency'] ?? 'MYR',
            'metadata' => $data,
        ]);
    }

    /**
     * Verify webhook signature from CHIP
     *
     * CHIP sends webhooks with X-Signature header containing
     * the public key signature for verification
     */
    protected function verifyWebhookSignature(Request $request): void
    {
        $signature = $request->header('X-Signature');

        if (!$signature) {
            Log::warning('CHIP: Webhook received without signature');
            throw new \Exception('Missing webhook signature');
        }

        // The webhook_secret contains the public key
        // Verify the signature matches the webhook_secret
        // Note: CHIP's webhook verification process uses the public key
        // that you get when registering your webhook URL

        $payload = $request->getContent();

        // For now, we're logging for debugging
        // In production, implement proper signature verification based on CHIP's documentation
        Log::info('CHIP: Webhook signature verification', [
            'signature' => $signature,
            'has_secret' => !empty($this->webhookSecret)
        ]);

        // TODO: Implement actual signature verification using openssl_verify
        // with the public key (webhook_secret) and the signature
    }

    protected function mapStatus($chipStatus): string
    {
        return match ($chipStatus) {
            'paid' => 'success',
            'pending' => 'pending',
            'failed', 'cancelled' => 'failed',
            default => 'pending',
        };
    }
}
