<?php

namespace App\Console\Commands;

use App\Models\PaymentGateway;
use App\Models\Transaction;
use App\Models\UserSubscription;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class VerifyChipPayment extends Command
{
    protected $signature = 'chip:verify {transaction_id?}';
    protected $description = 'Verify and process a CHIP payment';

    public function handle()
    {
        $transactionId = $this->argument('transaction_id');

        if (!$transactionId) {
            // Get all pending chip transactions
            $transactions = Transaction::where('gateway', 'chip')
                ->where('status', 'pending')
                ->get();

            if ($transactions->isEmpty()) {
                $this->info('No pending CHIP transactions found.');
                return 0;
            }

            $this->info("Found {$transactions->count()} pending CHIP transactions:");
            foreach ($transactions as $transaction) {
                $this->line("  - ID: {$transaction->id}, Purchase ID: {$transaction->transaction_id}, User: {$transaction->user_id}");
            }

            $transactionId = $this->ask('Enter the transaction ID to verify');
        }

        $transaction = Transaction::find($transactionId);

        if (!$transaction) {
            $this->error('Transaction not found!');
            return 1;
        }

        $this->info("Verifying transaction #{$transaction->id}...");
        $this->info("Purchase ID: {$transaction->transaction_id}");

        try {
            $gateway = PaymentGateway::where('code', 'chip')->firstOrFail();
            $apiKey = $gateway->getDecryptedConfig('api_key');

            $response = Http::withToken($apiKey)
                ->get("https://gate.chip-in.asia/api/v1/purchases/{$transaction->transaction_id}/");

            if (!$response->successful()) {
                $this->error('Failed to verify with CHIP API');
                $this->error($response->body());
                return 1;
            }

            $data = $response->json();
            $chipStatus = $data['status'];
            $this->info("CHIP Status: {$chipStatus}");

            $status = match ($chipStatus) {
                'paid' => 'success',
                'pending' => 'pending',
                'failed', 'cancelled' => 'failed',
                default => 'pending',
            };

            // Update transaction
            $transaction->update([
                'status' => $status,
                'metadata' => array_merge($transaction->metadata ?? [], $data),
            ]);

            $this->info("✓ Transaction status updated to: {$status}");

            if ($status === 'success') {
                // Activate subscription
                $subscription = UserSubscription::where('user_id', $transaction->user_id)
                    ->where('plan_id', $transaction->plan_id)
                    ->first();

                if ($subscription) {
                    $duration = $subscription->billing_cycle === 'monthly' ? 1 : 12;
                    $unit = $subscription->billing_cycle === 'monthly' ? 'month' : 'year';

                    $newEndsAt = $subscription->ends_at && $subscription->ends_at->isFuture()
                        ? $subscription->ends_at->copy()->add($duration, $unit)
                        : now()->add($duration, $unit);

                    $subscription->update([
                        'status' => 'active',
                        'trial_ends_at' => null,
                        'ends_at' => $newEndsAt,
                        'payment_gateway' => 'chip',
                        'gateway_subscription_id' => $transaction->transaction_id,
                    ]);

                    $this->info("✓ Subscription activated!");
                    $this->info("  - Plan: {$subscription->plan->name}");
                    $this->info("  - Ends at: {$newEndsAt}");
                } else {
                    $this->warn('Subscription not found for this transaction');
                }
            }

            return 0;

        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            return 1;
        }
    }
}
