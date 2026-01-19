<?php

namespace App\Console\Commands;

use App\Mail\PaymentReminderMail;
use App\Models\Invoice;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendPaymentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:payment-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send payment reminder emails for overdue invoices';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $reminders = [
            7 => 'invoices 7 days overdue',
            14 => 'invoices 14 days overdue',
            30 => 'invoices 30 days overdue',
        ];

        foreach ($reminders as $days => $description) {
            $this->info("Checking {$description}...");

            $targetDate = now()->subDays($days)->startOfDay();

            $invoices = Invoice::where('status', 'unpaid')
                ->whereBetween('due_date', [$targetDate, $targetDate->copy()->endOfDay()])
                ->with(['customer', 'tenant'])
                ->get();

            foreach ($invoices as $invoice) {
                if ($invoice->customer && $invoice->customer->email) {
                    $this->line("  Sending to {$invoice->customer->email}");

                    Mail::to($invoice->customer->email)->send(
                        new PaymentReminderMail(
                            $invoice,
                            $invoice->customer,
                            $days
                        )
                    );
                }
            }

            $this->info("  Sent {$invoices->count()} reminder(s)");
        }

        return Command::SUCCESS;
    }
}
