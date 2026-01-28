<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule trial ending reminders - daily at 9 AM
Schedule::command('subscriptions:trial-reminders')->dailyAt('09:00');

// Schedule payment reminders - daily at 10 AM
Schedule::command('invoices:payment-reminders')->dailyAt('10:00');
