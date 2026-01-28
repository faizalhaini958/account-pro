<?php

namespace App\Notifications;

use App\Models\UserSubscription;
use App\Models\SubscriptionPlan;
use App\Models\PaymentTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentSuccessfulNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public UserSubscription $subscription,
        public SubscriptionPlan $plan,
        public PaymentTransaction $transaction
    ) {
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Payment Received - Thank You!')
            ->view('emails.subscription.payment-successful', [
                'user' => $notifiable,
                'subscription' => $this->subscription,
                'plan' => $this->plan,
                'transaction' => $this->transaction,
            ]);
    }
}
