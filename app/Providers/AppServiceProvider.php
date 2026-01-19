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
}
