<?php

namespace App\Observers;

use App\Models\PaymentTransaction;
use App\Models\UserSubscription;
use App\Notifications\PaymentFailedNotification;
use App\Notifications\PaymentSuccessfulNotification;

class PaymentTransactionObserver
{
    /**
     * Handle the PaymentTransaction "created" event.
     */
    public function created(PaymentTransaction $transaction): void
    {
        // Send notification for completed payments on creation
        if ($transaction->status === 'completed' && $transaction->user && $transaction->subscription) {
            $subscription = UserSubscription::with('plan')->find($transaction->subscription_id);

            if ($subscription) {
                $transaction->user->notify(new PaymentSuccessfulNotification(
                    $subscription,
                    $subscription->plan,
                    $transaction
                ));
            }
        }
    }

    /**
     * Handle the PaymentTransaction "updated" event.
     */
    public function updated(PaymentTransaction $transaction): void
    {
        // Check if status changed
        if ($transaction->isDirty('status')) {
            $newStatus = $transaction->status;
            $oldStatus = $transaction->getOriginal('status');

            // Notify when payment completes
            if ($newStatus === 'completed' && $oldStatus !== 'completed') {
                if ($transaction->user && $transaction->subscription) {
                    $subscription = UserSubscription::with('plan')->find($transaction->subscription_id);

                    if ($subscription) {
                        $transaction->user->notify(new PaymentSuccessfulNotification(
                            $subscription,
                            $subscription->plan,
                            $transaction
                        ));
                    }
                }
            }

            // Notify when payment fails
            if (in_array($newStatus, ['failed', 'declined', 'error']) && !in_array($oldStatus, ['failed', 'declined', 'error'])) {
                if ($transaction->user && $transaction->subscription) {
                    $subscription = UserSubscription::find($transaction->subscription_id);

                    if ($subscription) {
                        $reason = $transaction->gateway_response['error'] ??
                                 $transaction->gateway_response['message'] ??
                                 'Payment declined';

                        $transaction->user->notify(new PaymentFailedNotification(
                            $subscription,
                            (float) $transaction->amount,
                            $reason
                        ));
                    }
                }
            }
        }
    }
}
