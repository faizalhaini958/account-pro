<?php

namespace App\Notifications;

use App\Models\UserSubscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Traits\RendersEmailTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TrialStartedNotification extends Notification implements ShouldQueue
{
    use Queueable, RendersEmailTemplate;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public UserSubscription $subscription,
        public SubscriptionPlan $plan
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
        return $this->renderEmailFromTemplate('trial-started', [
            'user_name' => $notifiable->name,
            'plan_name' => $this->plan->name,
            'trial_end_date' => $this->subscription->trial_ends_at->format('F j, Y'),
            'price' => 'RM ' . number_format($this->subscription->price, 2),
            'billing_cycle' => $this->subscription->billing_cycle,
            'app_name' => config('app.name'),
            'app_url' => config('app.url'),
        ]);
    }

    /**
     * Fallback message if template not found
     */
    protected function fallbackMessage(string $templateKey, array $data): MailMessage
    {
        return (new MailMessage)
            ->subject('Welcome to BukuKira - Your Trial Has Started!')
            ->view('emails.subscription.trial-started', [
                'user' => (object)['name' => $data['user_name']],
                'subscription' => $this->subscription,
                'plan' => $this->plan,
            ]);
    }
}
