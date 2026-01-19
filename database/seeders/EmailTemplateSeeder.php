<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $templates = [
            // Authentication Templates
            [
                'key' => 'verify-email',
                'name' => 'Email Verification',
                'category' => 'auth',
                'subject' => 'Verify Your Email Address - {{app_name}}',
                'variables' => ['user_name', 'verification_url', 'app_name', 'app_url'],
                'description' => 'Sent when a new user registers and needs to verify their email address',
                'content' => '<h1>Verify Your Email Address</h1>

<p>Hello {{user_name}},</p>

<p>Thank you for registering with BukuKira! Please verify your email address by clicking the button below:</p>

<a href="{{verification_url}}" class="button">Verify Email Address</a>

<p class="text-muted">This verification link will expire in 60 minutes.</p>

<div class="info-box">
    <p style="margin-bottom: 0;"><strong>Why verify your email?</strong></p>
    <p style="margin-bottom: 0; margin-top: 8px;">Email verification helps us ensure the security of your account and enables you to receive important notifications about your subscription and invoices.</p>
</div>

<p>If you did not create an account, no further action is required.</p>',
            ],
            [
                'key' => 'reset-password',
                'name' => 'Password Reset',
                'category' => 'auth',
                'subject' => 'Reset Your Password - {{app_name}}',
                'variables' => ['reset_url', 'app_name', 'app_url'],
                'description' => 'Sent when a user requests to reset their password',
                'content' => '<h1>Reset Your Password</h1>

<p>Hello,</p>

<p>You are receiving this email because we received a password reset request for your account.</p>

<a href="{{reset_url}}" class="button">Reset Password</a>

<p class="text-muted">This password reset link will expire in 60 minutes.</p>

<div class="info-box">
    <p style="margin-bottom: 0;"><strong>Security Tip:</strong></p>
    <p style="margin-bottom: 0; margin-top: 8px;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
</div>',
            ],

            // Subscription Templates
            [
                'key' => 'trial-started',
                'name' => 'Trial Started',
                'category' => 'subscription',
                'subject' => 'Welcome to {{app_name}} - Your Trial Has Started!',
                'variables' => ['user_name', 'plan_name', 'trial_end_date', 'price', 'billing_cycle', 'app_name', 'app_url'],
                'description' => 'Sent when a user starts a trial subscription',
                'content' => '<h1>Welcome to BukuKira! 🎉</h1>

<p>Hello {{user_name}},</p>

<p>Thank you for signing up! Your <strong>{{plan_name}}</strong> plan is now active with a <strong>14-day free trial</strong>.</p>

<div class="info-box">
    <p style="margin: 0;"><strong>Plan:</strong> {{plan_name}}</p>
    <p style="margin: 4px 0;"><strong>Trial Ends:</strong> {{trial_end_date}}</p>
    <p style="margin: 4px 0;"><strong>Price After Trial:</strong> {{price}}/{{billing_cycle}}</p>
</div>

<p><strong>Get started with these steps:</strong></p>
<ol style="padding-left: 20px; margin: 16px 0;">
    <li style="margin-bottom: 8px;">Complete your company profile settings</li>
    <li style="margin-bottom: 8px;">Set up your Chart of Accounts</li>
    <li style="margin-bottom: 8px;">Add your first customer or supplier</li>
    <li style="margin-bottom: 8px;">Create your first invoice</li>
    <li style="margin-bottom: 8px;">Configure e-Invoice settings for LHDN compliance</li>
</ol>

<a href="{{app_url}}/dashboard" class="button">Go to Dashboard</a>

<p>If you have any questions, our support team is here to help!</p>',
            ],
            [
                'key' => 'trial-ending',
                'name' => 'Trial Ending Soon',
                'category' => 'subscription',
                'subject' => 'Your {{app_name}} Trial Ends in {{days_remaining}} Days',
                'variables' => ['user_name', 'plan_name', 'days_remaining', 'trial_end_date', 'next_payment_amount', 'next_payment_date', 'app_name', 'app_url'],
                'description' => 'Sent 7, 3, and 1 days before trial ends',
                'content' => '<h1>Your Trial is Ending Soon</h1>

<p>Hello {{user_name}},</p>

<p>This is a friendly reminder that your <strong>{{plan_name}}</strong> plan trial will end in <strong>{{days_remaining}} days</strong>.</p>

<div class="info-box">
    <p style="margin: 0;"><strong>Trial Ends:</strong> {{trial_end_date}}</p>
    <p style="margin: 4px 0;"><strong>Next Payment:</strong> {{next_payment_amount}} on {{next_payment_date}}</p>
</div>

<p><strong>What happens next?</strong></p>
<ul style="padding-left: 20px; margin: 16px 0;">
    <li style="margin-bottom: 8px;">Your subscription will automatically continue after the trial</li>
    <li style="margin-bottom: 8px;">You\'ll be charged {{next_payment_amount}} on {{next_payment_date}}</li>
    <li style="margin-bottom: 8px;">All your data and settings will remain intact</li>
</ul>

<a href="{{app_url}}/profile/edit#subscription" class="button">Manage Subscription</a>

<p>Want to cancel? You can cancel anytime before {{trial_end_date}} and you won\'t be charged.</p>',
            ],
            [
                'key' => 'payment-successful',
                'name' => 'Payment Successful',
                'category' => 'subscription',
                'subject' => 'Payment Received - Thank You!',
                'variables' => ['user_name', 'transaction_id', 'amount', 'payment_date', 'plan_name', 'next_billing_date', 'app_name', 'app_url'],
                'description' => 'Sent when a subscription payment is successfully processed',
                'content' => '<h1>Payment Received - Thank You!</h1>

<p>Hello {{user_name}},</p>

<p>We\'ve successfully processed your payment for your BukuKira subscription. Thank you for your continued trust!</p>

<div class="info-box">
    <p style="margin: 0;"><strong>Transaction ID:</strong> {{transaction_id}}</p>
    <p style="margin: 4px 0;"><strong>Amount Paid:</strong> {{amount}}</p>
    <p style="margin: 4px 0;"><strong>Payment Date:</strong> {{payment_date}}</p>
    <p style="margin: 4px 0;"><strong>Plan:</strong> {{plan_name}}</p>
    <p style="margin: 4px 0;"><strong>Next Billing Date:</strong> {{next_billing_date}}</p>
</div>

<p><strong>Your subscription is now active until {{next_billing_date}}.</strong></p>

<p>We\'ll send you a reminder before your next billing date.</p>',
            ],
            [
                'key' => 'payment-failed',
                'name' => 'Payment Failed',
                'category' => 'subscription',
                'subject' => 'Payment Failed - Action Required',
                'variables' => ['user_name', 'amount', 'reason', 'retry_date', 'app_name', 'app_url'],
                'description' => 'Sent when a subscription payment fails',
                'content' => '<h1>Payment Failed - Action Required</h1>

<p>Hello {{user_name}},</p>

<p>We were unable to process your payment for your BukuKira subscription.</p>

<div class="info-box" style="border-left-color: #ef4444;">
    <p style="margin: 0;"><strong>Amount:</strong> {{amount}}</p>
    <p style="margin: 4px 0;"><strong>Reason:</strong> {{reason}}</p>
</div>

<p><strong>What you should do:</strong></p>
<ol style="padding-left: 20px; margin: 16px 0;">
    <li style="margin-bottom: 8px;">Check that your payment method is valid and has sufficient funds</li>
    <li style="margin-bottom: 8px;">Update your payment information if needed</li>
    <li style="margin-bottom: 8px;">Contact your bank if the issue persists</li>
</ol>

<a href="{{app_url}}/profile/edit#subscription" class="button" style="background-color: #ef4444;">Update Payment Method</a>

<p class="text-muted">We\'ll automatically retry the payment in 3 days.</p>',
            ],
            [
                'key' => 'subscription-expired',
                'name' => 'Subscription Expired',
                'category' => 'subscription',
                'subject' => 'Your {{app_name}} Subscription Has Expired',
                'variables' => ['user_name', 'plan_name', 'expiry_date', 'app_name', 'app_url'],
                'description' => 'Sent when a subscription expires',
                'content' => '<h1>Your Subscription Has Expired</h1>

<p>Hello {{user_name}},</p>

<p>Your <strong>{{plan_name}}</strong> subscription has expired as of {{expiry_date}}.</p>

<div class="info-box">
    <p style="margin-bottom: 0;"><strong>Your account is now in read-only mode.</strong></p>
    <p style="margin-bottom: 0; margin-top: 8px;">You can still view your data, but you won\'t be able to create or edit records until you reactivate your subscription.</p>
</div>

<a href="{{app_url}}/profile/edit#subscription" class="button">Reactivate Subscription</a>

<p><strong>Don\'t worry - your data is safe!</strong></p>
<p class="text-muted">All your companies, invoices, customers, and financial records are securely stored.</p>',
            ],

            // Invoice Templates
            [
                'key' => 'invoice-sent',
                'name' => 'Invoice Sent',
                'category' => 'invoice',
                'subject' => 'Invoice #{{invoice_number}} from {{app_name}}',
                'variables' => ['customer_name', 'invoice_number', 'invoice_date', 'due_date', 'total_amount', 'currency', 'app_name'],
                'description' => 'Sent when an invoice is emailed to a customer',
                'content' => '<h1>New Invoice #{{invoice_number}}</h1>

<p>Hello {{customer_name}},</p>

<p>Thank you for your business! Please find your invoice details below:</p>

<div class="info-box">
    <p style="margin: 0;"><strong>Invoice Number:</strong> {{invoice_number}}</p>
    <p style="margin: 4px 0;"><strong>Invoice Date:</strong> {{invoice_date}}</p>
    <p style="margin: 4px 0;"><strong>Due Date:</strong> {{due_date}}</p>
    <p style="margin: 4px 0;"><strong>Total Amount:</strong> {{currency}} {{total_amount}}</p>
</div>

<p><strong>Payment Instructions:</strong></p>
<p>Please make payment to the bank account details shown on the attached invoice. Payment is due by {{due_date}}.</p>

<p class="text-muted">A PDF copy of this invoice is attached to this email.</p>',
            ],
            [
                'key' => 'payment-reminder',
                'name' => 'Payment Reminder',
                'category' => 'invoice',
                'subject' => 'Payment Reminder - Invoice #{{invoice_number}}',
                'variables' => ['customer_name', 'invoice_number', 'invoice_date', 'due_date', 'days_overdue', 'amount_due', 'currency', 'app_name'],
                'description' => 'Sent for overdue invoices',
                'content' => '<h1>Payment Reminder - Invoice #{{invoice_number}}</h1>

<p>Hello {{customer_name}},</p>

<p>This is a friendly reminder that payment for the following invoice is now overdue:</p>

<div class="info-box" style="border-left-color: #f59e0b;">
    <p style="margin: 0;"><strong>Invoice Number:</strong> {{invoice_number}}</p>
    <p style="margin: 4px 0;"><strong>Due Date:</strong> {{due_date}}</p>
    <p style="margin: 4px 0;"><strong>Days Overdue:</strong> {{days_overdue}}</p>
    <p style="margin: 4px 0;"><strong>Amount Due:</strong> {{currency}} {{amount_due}}</p>
</div>

<p>Please arrange for payment at your earliest convenience. If you have already made this payment, please disregard this reminder.</p>',
            ],

            // e-Invoice Templates
            [
                'key' => 'einvoice-submitted',
                'name' => 'e-Invoice Submitted',
                'category' => 'einvoice',
                'subject' => 'e-Invoice Submitted Successfully',
                'variables' => ['invoice_number', 'uuid', 'submission_id', 'status', 'submitted_at', 'app_name'],
                'description' => 'Sent when an e-Invoice is submitted to LHDN',
                'content' => '<h1>e-Invoice Submitted Successfully</h1>

<p>Hello,</p>

<p>Your e-Invoice has been successfully submitted to LHDN (MyInvois) and is being processed.</p>

<div class="info-box" style="border-left-color: #22c55e;">
    <p style="margin: 0;"><strong>Invoice Number:</strong> {{invoice_number}}</p>
    <p style="margin: 4px 0;"><strong>UUID:</strong> {{uuid}}</p>
    <p style="margin: 4px 0;"><strong>Submission ID:</strong> {{submission_id}}</p>
    <p style="margin: 4px 0;"><strong>Status:</strong> {{status}}</p>
    <p style="margin: 4px 0;"><strong>Submitted At:</strong> {{submitted_at}}</p>
</div>

<p class="text-muted">Processing typically takes a few minutes, but may take longer during peak times.</p>',
            ],
            [
                'key' => 'einvoice-validated',
                'name' => 'e-Invoice Validated',
                'category' => 'einvoice',
                'subject' => 'e-Invoice Validated Successfully',
                'variables' => ['invoice_number', 'uuid', 'validated_at', 'app_name', 'app_url'],
                'description' => 'Sent when an e-Invoice is validated by LHDN',
                'content' => '<h1>e-Invoice Validated Successfully ✓</h1>

<p>Hello,</p>

<p>Great news! Your e-Invoice has been validated by LHDN (MyInvois) and is now official.</p>

<div class="info-box" style="border-left-color: #22c55e;">
    <p style="margin: 0;"><strong>Invoice Number:</strong> {{invoice_number}}</p>
    <p style="margin: 4px 0;"><strong>UUID:</strong> {{uuid}}</p>
    <p style="margin: 4px 0;"><strong>Validated At:</strong> {{validated_at}}</p>
</div>

<p>The validated e-Invoice with LHDN QR code is now available in your dashboard.</p>',
            ],
            [
                'key' => 'einvoice-rejected',
                'name' => 'e-Invoice Rejected',
                'category' => 'einvoice',
                'subject' => 'e-Invoice Submission Failed - Action Required',
                'variables' => ['invoice_number', 'uuid', 'status', 'error_message', 'app_name', 'app_url'],
                'description' => 'Sent when an e-Invoice submission is rejected by LHDN',
                'content' => '<h1>e-Invoice Submission Failed</h1>

<p>Hello,</p>

<p>Unfortunately, your e-Invoice submission to LHDN (MyInvois) was rejected.</p>

<div class="info-box" style="border-left-color: #ef4444;">
    <p style="margin: 0;"><strong>Invoice Number:</strong> {{invoice_number}}</p>
    <p style="margin: 4px 0;"><strong>UUID:</strong> {{uuid}}</p>
    <p style="margin: 4px 0;"><strong>Error:</strong> {{error_message}}</p>
</div>

<p><strong>What You Should Do:</strong></p>
<ol style="padding-left: 20px; margin: 16px 0;">
    <li style="margin-bottom: 8px;">Review the error message above</li>
    <li style="margin-bottom: 8px;">Correct the invoice information in your dashboard</li>
    <li style="margin-bottom: 8px;">Resubmit the e-Invoice</li>
</ol>',
            ],
        ];

        foreach ($templates as $template) {
            EmailTemplate::updateOrCreate(
                ['key' => $template['key']],
                $template
            );
        }
    }
}
