<?php

namespace App\Http\Controllers\Subscription;

use App\Http\Controllers\Controller;
use App\Models\PaymentGateway;
use App\Models\Transaction;
use App\Models\UserSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

/**
 * Handles user-facing redirect URLs after payment completion
 *
 * These routes are where users land after completing payment on the gateway.
 * Also verifies payment status directly since callbacks may not always trigger.
 */
class PaymentRedirectController extends Controller
{
    /**
     * Handle successful payment redirect
     *
     * User is redirected here after successful payment on CHIP
     * Verifies the payment and activates subscription
     */
    public function success(Request $request)
    {
        Log::info('Payment redirect - Success', [
            'user_id' => auth()->id(),
            'params' => $request->all(),
        ]);

        // Get purchase ID from CHIP redirect
        $purchaseId = $request->query('id') ?? $request->query('purchase_id');

        if ($purchaseId) {
            try {
                // Verify payment with CHIP API
                $this->verifyAndProcessPayment($purchaseId);

                return redirect()
                    ->route('dashboard')
                    ->with('success', 'Payment successful! Your subscription is now active. Thank you for your payment.');
            } catch (\Exception $e) {
                Log::error('Payment verification failed on redirect', [
                    'purchase_id' => $purchaseId,
                    'error' => $e->getMessage(),
                ]);

                return redirect()
                    ->route('dashboard')
                    ->with('warning', 'Payment received. We are verifying your payment and will activate your subscription shortly.');
            }
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Payment successful! Your subscription is now active. Thank you for your payment.');
    }

    /**
     * Verify payment with CHIP and process subscription
     */
    protected function verifyAndProcessPayment(string $purchaseId)
    {
        // Get CHIP gateway configuration
        $gateway = PaymentGateway::where('code', 'chip')->firstOrFail();
        $apiKey = $gateway->getDecryptedConfig('api_key');

        // Verify with CHIP API
        $response = Http::withToken($apiKey)
            ->get("https://gate.chip-in.asia/api/v1/purchases/{$purchaseId}/");

        if (!$response->successful()) {
            throw new \Exception('Failed to verify payment with CHIP');
        }

        $data = $response->json();
        $status = $this->mapChipStatus($data['status']);

        Log::info('CHIP payment verified', [
            'purchase_id' => $purchaseId,
            'chip_status' => $data['status'],
            'mapped_status' => $status,
        ]);

        // Find and update transaction
        $transaction = Transaction::where('transaction_id', $purchaseId)
            ->where('gateway', 'chip')
            ->first();

        if (!$transaction) {
            Log::error('Transaction not found for purchase', ['purchase_id' => $purchaseId]);
            throw new \Exception('Transaction record not found');
        }

        // Update transaction status
        $transaction->update([
            'status' => $status,
            'metadata' => array_merge($transaction->metadata ?? [], $data),
        ]);

        // If payment successful, activate subscription
        if ($status === 'success') {
            $this->fulfillSubscription($transaction);
        }
    }

    /**
     * Activate the subscription
     */
    protected function fulfillSubscription(Transaction $transaction)
    {
        $subscription = UserSubscription::where('user_id', $transaction->user_id)
            ->where('plan_id', $transaction->plan_id)
            ->first();

        if (!$subscription) {
            Log::error('Subscription not found for transaction', [
                'transaction_id' => $transaction->id,
                'user_id' => $transaction->user_id,
            ]);
            return;
        }

        // Calculate new end date
        $duration = $subscription->billing_cycle === 'monthly' ? 1 : 12;
        $unit = $subscription->billing_cycle === 'monthly' ? 'month' : 'year';

        $newEndsAt = $subscription->ends_at && $subscription->ends_at->isFuture()
            ? $subscription->ends_at->copy()->add($duration, $unit)
            : now()->add($duration, $unit);

        $subscription->update([
            'status' => 'active',
            'trial_ends_at' => null,
            'ends_at' => $newEndsAt,
            'payment_gateway' => $transaction->gateway,
            'gateway_subscription_id' => $transaction->transaction_id,
        ]);

        Log::info('Subscription activated', [
            'subscription_id' => $subscription->id,
            'user_id' => $transaction->user_id,
            'ends_at' => $newEndsAt,
        ]);
    }

    /**
     * Map CHIP status to our status
     */
    protected function mapChipStatus($chipStatus): string
    {
        return match ($chipStatus) {
            'paid' => 'success',
            'pending' => 'pending',
            'failed', 'cancelled' => 'failed',
            default => 'pending',
        };
    }

    /**
     * Handle failed payment redirect
     *
     * User is redirected here after failed/cancelled payment on CHIP
     * Shows an error message and suggests retry
     */
    public function failed(Request $request)
    {
        Log::info('Payment redirect - Failed', [
            'user_id' => auth()->id(),
            'params' => $request->all(),
        ]);

        $purchaseId = $request->query('id') ?? $request->query('purchase_id');

        if ($purchaseId) {
            Log::info('Failed payment redirect with purchase ID', [
                'purchase_id' => $purchaseId,
                'user_id' => auth()->id(),
            ]);
        }

        return redirect()
            ->route('checkout.index')
            ->with('error', 'Payment failed or was cancelled. Please try again or contact support if you continue to experience issues.');
    }
}
