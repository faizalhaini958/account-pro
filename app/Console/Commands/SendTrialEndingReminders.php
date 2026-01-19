<?php

namespace App\Console\Commands;

use App\Models\UserSubscription;
use App\Notifications\TrialEndingNotification;
use Illuminate\Console\Command;

class SendTrialEndingReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:trial-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send trial ending reminder emails';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $reminders = [
            7 => 'trials ending in 7 days',
            3 => 'trials ending in 3 days',
            1 => 'trials ending in 1 day',
        ];

        foreach ($reminders as $days => $description) {
            $this->info("Checking {$description}...");

            $targetDate = now()->addDays($days)->startOfDay();

            $subscriptions = UserSubscription::where('status', 'trialing')
                ->whereNotNull('trial_ends_at')
                ->whereBetween('trial_ends_at', [$targetDate, $targetDate->copy()->endOfDay()])
                ->with(['user', 'plan'])
                ->get();

            foreach ($subscriptions as $subscription) {
                $this->line("  Sending to {$subscription->user->email}");

                $subscription->user->notify(new TrialEndingNotification(
                    $subscription,
                    $subscription->plan,
                    $days
                ));
            }

            $this->info("  Sent {$subscriptions->count()} reminder(s)");
        }

        return Command::SUCCESS;
    }
}
