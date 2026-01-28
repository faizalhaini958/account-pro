# Email Notification System Documentation

## Overview
BukuKira now includes a comprehensive email notification system with branded templates and automated triggers for all critical business events.

## Email Templates

All email templates use a consistent branded layout with:
- BukuKira logo and branding
- Clean, professional design
- Responsive layout
- Footer links (Home, About, Privacy, Terms)
- Malaysian business context

### Template Location
All templates are located in `/resources/views/emails/`

## Notification Types

### 1. Authentication Emails

#### Email Verification
- **Trigger**: User registers for a new account
- **Template**: `emails/auth/verify-email.blade.php`
- **Class**: `App\Notifications\VerifyEmail`
- **Features**: 60-minute expiry, security explanation

#### Password Reset
- **Trigger**: User requests password reset
- **Template**: `emails/auth/reset-password.blade.php`
- **Class**: `App\Notifications\ResetPassword`
- **Features**: 60-minute expiry, security tips

### 2. Subscription Lifecycle Emails

#### Trial Started
- **Trigger**: User completes registration with a paid plan
- **Template**: `emails/subscription/trial-started.blade.php`
- **Class**: `App\Notifications\TrialStartedNotification`
- **Details**: Plan info, trial end date, getting started checklist

#### Trial Ending Reminders
- **Trigger**: Automated daily check via `subscriptions:trial-reminders` command
- **Template**: `emails/subscription/trial-ending.blade.php`
- **Class**: `App\Notifications\TrialEndingNotification`
- **Schedule**: Sent at 7, 3, and 1 days before trial ends
- **Features**: Next payment date, cancellation option

#### Payment Successful
- **Trigger**: Payment webhook or manual transaction recording
- **Template**: `emails/subscription/payment-successful.blade.php`
- **Class**: `App\Notifications\PaymentSuccessfulNotification`
- **Details**: Transaction ID, receipt download, next billing date

#### Payment Failed
- **Trigger**: Payment webhook failure or declined transaction
- **Template**: `emails/subscription/payment-failed.blade.php`
- **Class**: `App\Notifications\PaymentFailedNotification`
- **Features**: Failure reason, retry information, update payment method link

#### Subscription Expired
- **Trigger**: Subscription status changes to 'expired'
- **Template**: `emails/subscription/subscription-expired.blade.php`
- **Class**: `App\Notifications\SubscriptionExpiredNotification`
- **Observer**: `App\Observers\SubscriptionObserver`
- **Features**: Read-only mode explanation, reactivation link

### 3. Invoice & Document Emails

#### Invoice Sent
- **Trigger**: Manual send via invoice controller
- **Template**: `emails/invoices/invoice-sent.blade.php`
- **Class**: `App\Mail\InvoiceMail`
- **Attachment**: PDF invoice
- **Features**: Full invoice details, itemized list, payment instructions

#### Payment Reminder
- **Trigger**: Automated daily check via `invoices:payment-reminders` command
- **Template**: `emails/invoices/payment-reminder.blade.php`
- **Class**: `App\Mail\PaymentReminderMail`
- **Schedule**: Sent at 7, 14, and 30 days overdue
- **Attachment**: PDF invoice
- **Features**: Days overdue, polite reminder tone

### 4. e-Invoice (MyInvois/LHDN) Emails

#### e-Invoice Submitted
- **Trigger**: e-Invoice document created with 'submitted' status
- **Template**: `emails/einvoice/submitted.blade.php`
- **Class**: `App\Notifications\EInvoiceSubmittedNotification`
- **Observer**: `App\Observers\EInvoiceDocumentObserver`
- **Details**: UUID, submission ID, processing timeline

#### e-Invoice Validated
- **Trigger**: e-Invoice status changes to 'validated'
- **Template**: `emails/einvoice/validated.blade.php`
- **Class**: `App\Notifications\EInvoiceValidatedNotification`
- **Observer**: `App\Observers\EInvoiceDocumentObserver`
- **Features**: QR code confirmation, download link

#### e-Invoice Rejected
- **Trigger**: e-Invoice status changes to 'rejected' or 'failed'
- **Template**: `emails/einvoice/rejected.blade.php`
- **Class**: `App\Notifications\EInvoiceRejectedNotification`
- **Observer**: `App\Observers\EInvoiceDocumentObserver`
- **Features**: Error message, correction guide, edit link

## Automated Commands

### Trial Ending Reminders
```bash
php artisan subscriptions:trial-reminders
```
- **Schedule**: Daily at 9:00 AM (configured in `routes/console.php`)
- **Action**: Sends reminders for trials ending in 7, 3, and 1 day(s)

### Payment Reminders
```bash
php artisan invoices:payment-reminders
```
- **Schedule**: Daily at 10:00 AM (configured in `routes/console.php`)
- **Action**: Sends reminders for invoices 7, 14, and 30 days overdue

## Model Observers

### SubscriptionObserver
**File**: `app/Observers/SubscriptionObserver.php`
**Monitors**: 
- Status changes to 'expired' → sends expiration notification

### EInvoiceDocumentObserver
**File**: `app/Observers/EInvoiceDocumentObserver.php`
**Monitors**:
- Created with 'submitted' status → sends submission notification
- Status changes to 'validated' → sends validation notification
- Status changes to 'rejected'/'failed' → sends rejection notification

## Integration Points

### User Registration
**File**: `app/Http/Controllers/Auth/RegisteredUserController.php`
- Sends `TrialStartedNotification` after subscription creation
- Sends email verification via custom `VerifyEmail` notification

### User Model
**File**: `app/Models/User.php`
- Implements `MustVerifyEmail` interface
- Overrides `sendEmailVerificationNotification()` with custom template
- Overrides `sendPasswordResetNotification()` with custom template

### Invoice Sending Helper
**File**: `app/Traits/SendsInvoiceEmails.php`
**Usage**:
```php
use App\Traits\SendsInvoiceEmails;

class InvoiceController extends Controller
{
    use SendsInvoiceEmails;
    
    public function send(Invoice $invoice)
    {
        if ($this->sendInvoiceEmail($invoice)) {
            return back()->with('success', 'Invoice sent successfully');
        }
        return back()->with('error', 'Failed to send invoice');
    }
}
```

## Queue Configuration

All notifications implement `ShouldQueue` interface and will be queued when:
- Queue worker is running: `php artisan queue:work`
- Queue is configured in `.env` (default: sync for development, redis/database for production)

### Running Queue Worker
```bash
# Development
php artisan queue:work

# Production (with Supervisor or systemd)
php artisan queue:work --tries=3 --timeout=90
```

## Testing Emails

### Test SMTP Configuration
```bash
# Via admin panel
Navigate to: Settings → SMTP Settings → Test Email

# Or manually test
php artisan tinker
>>> Mail::raw('Test email', function($msg) { $msg->to('your@email.com')->subject('Test'); });
```

### Test Notifications Manually
```php
// Test trial started notification
$user = User::find(1);
$subscription = $user->subscription;
$plan = $subscription->plan;
$user->notify(new \App\Notifications\TrialStartedNotification($subscription, $plan));

// Test e-Invoice validation
$eInvoiceDoc = EInvoiceDocument::find(1);
$user->notify(new \App\Notifications\EInvoiceValidatedNotification(
    $eInvoiceDoc->invoice,
    $eInvoiceDoc
));
```

### Test Commands
```bash
# Test trial reminders (dry run in logs)
php artisan subscriptions:trial-reminders

# Test payment reminders
php artisan invoices:payment-reminders
```

## Customization

### Modifying Email Templates
1. Edit blade files in `/resources/views/emails/`
2. Base layout is in `emails/layout.blade.php`
3. All templates extend the base layout

### Modifying Notification Logic
1. Notification classes are in `/app/Notifications/`
2. Mailable classes are in `/app/Mail/`
3. Observers are in `/app/Observers/`

### Adding New Notifications
1. Create notification class: `php artisan make:notification YourNotification`
2. Create email template in `/resources/views/emails/your-folder/`
3. Trigger notification in appropriate controller/observer

## SMTP Configuration

Configure SMTP in Admin Panel:
1. Navigate to **Settings → SMTP Settings**
2. Configure driver (smtp/sendmail/mailgun/ses/postmark)
3. Enter credentials
4. Test configuration

### Common Providers

**Gmail**
- Host: smtp.gmail.com
- Port: 587
- Encryption: TLS
- Use App Password (not regular password)

**Office 365**
- Host: smtp.office365.com
- Port: 587
- Encryption: STARTTLS

**Mailgun**
- Host: smtp.mailgun.org
- Port: 587
- Encryption: TLS

## Production Checklist

- [ ] Configure production SMTP credentials
- [ ] Set `QUEUE_CONNECTION=database` or `redis` in `.env`
- [ ] Run migrations for queue tables: `php artisan queue:table && php artisan migrate`
- [ ] Set up queue worker with Supervisor/systemd
- [ ] Configure scheduler cron: `* * * * * cd /path && php artisan schedule:run >> /dev/null 2>&1`
- [ ] Test all notification types
- [ ] Monitor queue for failures: `php artisan queue:failed`
- [ ] Set up queue monitoring (e.g., Horizon for Redis)

## Troubleshooting

### Emails Not Sending
1. Check SMTP configuration in admin panel
2. Test SMTP connection using test button
3. Check queue worker is running: `ps aux | grep queue`
4. Check failed jobs: `php artisan queue:failed`
5. Check logs: `storage/logs/laravel.log`

### Queue Not Processing
```bash
# Clear failed jobs
php artisan queue:flush

# Restart queue worker
php artisan queue:restart

# Check queue status
php artisan queue:work --once
```

### Observer Not Triggering
1. Verify observer is registered in `AppServiceProvider::boot()`
2. Check model events are firing
3. Add logging to observer methods for debugging

## Support

For questions or issues with the email system:
- Check logs in `storage/logs/laravel.log`
- Review queue failed jobs: `php artisan queue:failed`
- Contact development team
