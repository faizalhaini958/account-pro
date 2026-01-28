<?php

namespace App\Http\Controllers\Subscription;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\PaymentGateway;
use App\Models\Transaction;
use App\Models\UserSubscription;
use Illuminate\Support\Facades\Log;

class PaymentCallbackController extends Controller
{
    public function handle(Request $request, string $gateway)
    {
        try {
            $gatewayModel = PaymentGateway::where('code', $gateway)->firstOrFail();
            
            $gatewayService = match ($gateway) {
                'chip' => new \App\Services\Payment\ChipGateway($gatewayModel),
                'kipple_pay' => new \App\Services\Payment\KipplePayGateway($gatewayModel),
                default => throw new \Exception('Gateway implementation not found'),
            };
            
            // Verify and get transaction details from gateway
            $transactionData = $gatewayService->handleCallback($request);
            
            // Find local transaction
            // Note: ChipGateway handleCallback returns a new Transaction object or helps find one. 
            // Better to find by transaction_id
            $transaction = Transaction::where('transaction_id', $transactionData->transaction_id)
                ->where('gateway', $gateway)
                ->first();

            if (!$transaction) {
                 Log::error("Transaction not found for ID: {$transactionData->transaction_id}");
                 return redirect()->route('dashboard')->with('error', 'Transaction record not found.');
            }

            // Update Transaction
            $transaction->update([
                'status' => $transactionData->status,
                'metadata' => array_merge($transaction->metadata ?? [], $transactionData->metadata ?? []),
            ]);

            if ($transaction->status === 'success') {
                $this->fulfillSubscription($transaction);
                return redirect()->route('dashboard')->with('success', 'Payment successful! Your subscription is active.');
            } else {
                return redirect()->route('checkout.index')->with('error', 'Payment failed or cancelled.');
            }

        } catch (\Exception $e) {
            Log::error('Payment Callback Error: ' . $e->getMessage());
            return redirect()->route('dashboard')->with('error', 'Payment verification failed.');
        }
    }

    protected function fulfillSubscription(Transaction $transaction)
    {
        $subscription = UserSubscription::where('user_id', $transaction->user_id)
            ->where('plan_id', $transaction->plan_id)
            ->first();
            
        if ($subscription) {
            // Extend subscription
            // If currently on trial, remove trial status?
            // "after trial ends, modal popup appear...". If they pay, trial logic is done.
            
            $duration = $subscription->billing_cycle === 'monthly' ? 1 : 12;
            $unit = $subscription->billing_cycle === 'monthly' ? 'month' : 'year';
            
            $newEndsAt = $subscription->ends_at && $subscription->ends_at->isFuture() 
                ? $subscription->ends_at->copy()->add($duration, $unit)
                : now()->add($duration, $unit);

            $subscription->update([
                'status' => 'active',
                'trial_ends_at' => null, // End trial immediately upon payment? Or keep it? Usually payment means fully active.
                'ends_at' => $newEndsAt,
                'payment_gateway' => $transaction->gateway,
                'gateway_subscription_id' => $transaction->transaction_id, // Or recurring ID if available
            ]);
        }
    }
}
