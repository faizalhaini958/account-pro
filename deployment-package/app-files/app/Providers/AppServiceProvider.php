<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Invoice;
use App\Models\PurchaseInvoice;
use App\Models\JournalEntry;
use App\Models\Quotation;
use App\Models\ChartOfAccount;
use App\Models\AuditLog;
use App\Models\UserSubscription;
use App\Models\EInvoiceDocument;
use App\Models\PaymentTransaction;
use App\Policies\InvoicePolicy;
use App\Policies\PurchaseInvoicePolicy;
use App\Policies\JournalEntryPolicy;
use App\Policies\QuotationPolicy;
use App\Policies\ChartOfAccountPolicy;
use App\Policies\AuditLogPolicy;
use App\Observers\SubscriptionObserver;
use App\Observers\EInvoiceDocumentObserver;
use App\Observers\PaymentTransactionObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected array $policies = [
        Invoice::class => InvoicePolicy::class,
        PurchaseInvoice::class => PurchaseInvoicePolicy::class,
        JournalEntry::class => JournalEntryPolicy::class,
        Quotation::class => QuotationPolicy::class,
        ChartOfAccount::class => ChartOfAccountPolicy::class,
        AuditLog::class => AuditLogPolicy::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Load SMTP settings from database
        $this->configureMail();

        // Register observers
        UserSubscription::observe(SubscriptionObserver::class);
        EInvoiceDocument::observe(EInvoiceDocumentObserver::class);
        PaymentTransaction::observe(PaymentTransactionObserver::class);

        // Register policies
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }

        Gate::before(function ($user, $ability) {
            return $user->isSuperAdmin() ? true : null;
        });

        // Dynamic permission check for all other capabilities
        Gate::after(function ($user, $ability) {
            return $user->hasPermission($ability);
        });

        Vite::prefetch(concurrency: 3);
    }

    /**
     * Configure mail settings from database
     */
    protected function configureMail(): void
    {
        try {
            // Check if database connection is available
            if (!\Illuminate\Support\Facades\Schema::hasTable('system_settings')) {
                return;
            }

            $settings = \App\Models\SystemSetting::getGroup('smtp');

            if (!empty($settings)) {
                config([
                    'mail.default' => $settings['mail_driver'] ?? config('mail.default'),
                    'mail.mailers.smtp.host' => $settings['mail_host'] ?? config('mail.mailers.smtp.host'),
                    'mail.mailers.smtp.port' => $settings['mail_port'] ?? config('mail.mailers.smtp.port'),
                    'mail.mailers.smtp.username' => $settings['mail_username'] ?? config('mail.mailers.smtp.username'),
                    'mail.mailers.smtp.password' => $settings['mail_password'] ?? config('mail.mailers.smtp.password'),
                    'mail.mailers.smtp.encryption' => $settings['mail_encryption'] ?? config('mail.mailers.smtp.encryption'),
                    'mail.from.address' => $settings['mail_from_address'] ?? config('mail.from.address'),
                    'mail.from.name' => $settings['mail_from_name'] ?? config('mail.from.name'),
                ]);
            }
        } catch (\Exception $e) {
            // Silently fail if database is not available (e.g., during migration)
            // This prevents errors during initial setup
        }
    }
}
