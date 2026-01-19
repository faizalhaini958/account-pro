<?php

namespace App\Observers;

use App\Models\UserSubscription;
use App\Notifications\PaymentSuccessfulNotification;
use App\Notifications\SubscriptionExpiredNotification;

class SubscriptionObserver
{
    /**
     * Handle the UserSubscription "updated" event.
     */
    public function updated(UserSubscription $subscription): void
    {
        // Check if subscription just expired
        if ($subscription->isDirty('status')) {
            if ($subscription->status === 'expired' && $subscription->getOriginal('status') !== 'expired') {
                $subscription->user->notify(new SubscriptionExpiredNotification(
                    $subscription,
                    $subscription->plan
                ));
            }
        }
    }
}
