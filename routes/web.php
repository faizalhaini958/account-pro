<?php

use App\Http\Controllers\ProfileController;
use App\Models\SubscriptionPlan;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $plans = SubscriptionPlan::active()
        ->orderBy('price_monthly')
        ->get(['id', 'code', 'name', 'description', 'price_monthly', 'price_yearly', 'features']);

    // Mark the most popular plan (usually the middle-tier one)
    $plans = $plans->map(function ($plan, $index) use ($plans) {
        $plan->is_popular = $index === 1 && $plans->count() >= 3; // Second plan if 3+ plans
        return $plan;
    });

    return Inertia::render('Home', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'plans' => $plans,
    ]);
});

// Public pages
Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::get('/privacy', function () {
    return Inertia::render('PrivacyPolicy');
})->name('privacy');

Route::get('/terms', function () {
    return Inertia::render('TermsOfUse');
})->name('terms');

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/profile/receipt/{transaction}', [ProfileController::class, 'receipt'])->name('profile.receipt');
    Route::delete('/subscription/cancel', [\App\Http\Controllers\Subscription\SubscriptionController::class, 'destroy'])->name('subscription.cancel');
    Route::post('/switch-tenant', \App\Http\Controllers\System\TenantSwitchController::class)->name('tenant.switch');

    // Subscription / Checkout
    Route::get('/checkout', [\App\Http\Controllers\Subscription\CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout', [\App\Http\Controllers\Subscription\CheckoutController::class, 'store'])->name('checkout.store');
    Route::any('/checkout/callback/{gateway}', [\App\Http\Controllers\Subscription\PaymentCallbackController::class, 'handle'])->name('checkout.callback');

    // Payment redirect routes (for user-facing redirects after payment)
    Route::get('/subscription/payment/success', [\App\Http\Controllers\Subscription\PaymentRedirectController::class, 'success'])->name('subscription.payment.success');
    Route::get('/subscription/payment/failed', [\App\Http\Controllers\Subscription\PaymentRedirectController::class, 'failed'])->name('subscription.payment.failed');

    // Company Management Routes
    Route::get('/companies', [\App\Http\Controllers\System\TenantController::class, 'index'])->name('companies.index');
    Route::post('/companies', [\App\Http\Controllers\System\TenantController::class, 'store'])->name('companies.store');
    Route::get('/companies/{company}/edit', [\App\Http\Controllers\System\TenantController::class, 'edit'])->name('companies.edit');
    Route::patch('/companies/{company}', [\App\Http\Controllers\System\TenantController::class, 'update'])->name('companies.update');
    Route::delete('/companies/{company}', [\App\Http\Controllers\System\TenantController::class, 'destroy'])->name('companies.destroy');

    // Sales Routes (legacy group - kept for compatibility)
    Route::group(['prefix' => 'sales', 'as' => 'sales.', 'middleware' => 'permission:sales.view'], function () {
        Route::post('quotations/{quotation}/mark-sent', [\App\Http\Controllers\Sales\QuotationController::class, 'markAsSent'])->name('quotations.mark-sent');
        Route::post('quotations/{quotation}/mark-accepted', [\App\Http\Controllers\Sales\QuotationController::class, 'markAsAccepted'])->name('quotations.mark-accepted');
        Route::post('quotations/{quotation}/mark-rejected', [\App\Http\Controllers\Sales\QuotationController::class, 'markAsRejected'])->name('quotations.mark-rejected');
        Route::get('quotations/{quotation}/pdf', [\App\Http\Controllers\Sales\QuotationController::class, 'pdf'])->name('quotations.pdf');
        Route::post('quotations/{quotation}/convert', [\App\Http\Controllers\Sales\QuotationController::class, 'convertToInvoice'])->name('quotations.convert');

        // Quotation Signature Routes
        Route::post('quotations/{quotation}/signature/computer', [\App\Http\Controllers\Sales\QuotationController::class, 'addComputerSignature'])->name('quotations.signature.computer');
        Route::post('quotations/{quotation}/signature/live', [\App\Http\Controllers\Sales\QuotationController::class, 'addLiveSignature'])->name('quotations.signature.live');
        Route::delete('quotations/{quotation}/signature', [\App\Http\Controllers\Sales\QuotationController::class, 'removeSignature'])->name('quotations.signature.remove');

        Route::resource('quotations', \App\Http\Controllers\Sales\QuotationController::class);
        Route::resource('delivery-orders', \App\Http\Controllers\Sales\DeliveryOrderController::class);

        Route::get('credit-notes/{creditNote}/pdf', [\App\Http\Controllers\Sales\CreditNoteController::class, 'pdf'])->name('credit-notes.pdf');
        Route::post('credit-notes/{creditNote}/post', [\App\Http\Controllers\Sales\CreditNoteController::class, 'post'])->name('credit-notes.post');
        Route::get('delivery-orders/{deliveryOrder}/pdf', [\App\Http\Controllers\Sales\DeliveryOrderController::class, 'pdf'])->name('delivery-orders.pdf');
        Route::resource('credit-notes', \App\Http\Controllers\Sales\CreditNoteController::class);

        Route::get('invoices', function () { return Inertia::render('Dashboard'); })->name('invoices.index'); // Placeholder
        Route::get('receipts', function () { return Inertia::render('Dashboard'); })->name('receipts.index'); // Placeholder
        Route::resource('customers', \App\Http\Controllers\Master\CustomerController::class);
    });

    // Sales Module
    Route::prefix('sales')->name('sales.')->middleware('permission:sales.view')->group(function () {
        Route::get('customers/{customer}/outstanding-invoices', [\App\Http\Controllers\Sales\ReceiptController::class, 'getOutstandingInvoices'])->name('customers.outstanding-invoices');
        Route::get('receipts/{receipt}/pdf', [\App\Http\Controllers\Sales\ReceiptController::class, 'pdf'])->name('receipts.pdf');
        Route::get('invoices/{invoice}/pdf', [\App\Http\Controllers\Sales\SalesInvoiceController::class, 'pdf'])->name('invoices.pdf');
        Route::get('invoices/{invoice}/items', [\App\Http\Controllers\Sales\SalesInvoiceController::class, 'getItems'])->name('invoices.items');
        Route::post('invoices/{invoice}/post', [\App\Http\Controllers\Sales\SalesInvoiceController::class, 'post'])->name('invoices.post');
        Route::post('invoices/{invoice}/void', [\App\Http\Controllers\Sales\SalesInvoiceController::class, 'void'])->name('invoices.void');
        Route::get('invoices/{invoice}/payment', [\App\Http\Controllers\Sales\SalesInvoiceController::class, 'payment'])->name('invoices.payment');

        // Invoice Signature Routes
        Route::post('invoices/{invoice}/signature/computer', [\App\Http\Controllers\Sales\SalesInvoiceController::class, 'addComputerSignature'])->name('invoices.signature.computer');
        Route::post('invoices/{invoice}/signature/live', [\App\Http\Controllers\Sales\SalesInvoiceController::class, 'addLiveSignature'])->name('invoices.signature.live');
        Route::delete('invoices/{invoice}/signature', [\App\Http\Controllers\Sales\SalesInvoiceController::class, 'removeSignature'])->name('invoices.signature.remove');

        Route::resource('invoices', \App\Http\Controllers\Sales\SalesInvoiceController::class);
        Route::resource('receipts', \App\Http\Controllers\Sales\ReceiptController::class);

        // Cash Transactions
        Route::post('cash-transactions/{cashTransaction}/post', [\App\Http\Controllers\Sales\CashTransactionController::class, 'post'])->name('cash-transactions.post');
        Route::post('cash-transactions/{cashTransaction}/void', [\App\Http\Controllers\Sales\CashTransactionController::class, 'void'])->name('cash-transactions.void');
        Route::post('cash-transactions/{cashTransaction}/upload-receipt', [\App\Http\Controllers\Sales\CashTransactionController::class, 'uploadReceipt'])->name('cash-transactions.upload-receipt');
        Route::delete('cash-transactions/{cashTransaction}/remove-receipt', [\App\Http\Controllers\Sales\CashTransactionController::class, 'removeReceipt'])->name('cash-transactions.remove-receipt');
        Route::resource('cash-transactions', \App\Http\Controllers\Sales\CashTransactionController::class);
    });

    // Purchase Module
    Route::prefix('purchase')->name('purchase.')->middleware('permission:purchases.view')->group(function () {
        Route::get('suppliers/{supplier}/outstanding-invoices', [\App\Http\Controllers\Purchase\PurchaseInvoiceController::class, 'getOutstanding'])->name('suppliers.outstanding-invoices');
        Route::resource('suppliers', \App\Http\Controllers\Purchase\SupplierController::class);
        Route::resource('expense-categories', \App\Http\Controllers\Purchase\ExpenseCategoryController::class);
        Route::resource('expenses', \App\Http\Controllers\Purchase\ExpenseController::class);

        Route::post('invoices/{purchaseInvoice}/post', [\App\Http\Controllers\Purchase\PurchaseInvoiceController::class, 'markAsPosted'])->name('invoices.post');
        Route::post('invoices/{purchaseInvoice}/void', [\App\Http\Controllers\Purchase\PurchaseInvoiceController::class, 'markAsVoid'])->name('invoices.void');
        Route::resource('invoices', \App\Http\Controllers\Purchase\PurchaseInvoiceController::class);
        Route::resource('payments', \App\Http\Controllers\Purchase\SupplierPaymentController::class);
    });

    // Accounting Module
    Route::prefix('accounting')->name('accounting.')->middleware('permission:accounting.view')->group(function () {
        Route::post('coa/seed-defaults', [\App\Http\Controllers\Accounting\ChartOfAccountController::class, 'seedDefaults'])->name('coa.seed-defaults');
        Route::resource('coa', \App\Http\Controllers\Accounting\ChartOfAccountController::class)->parameters(['coa' => 'chartOfAccount']);
        Route::resource('journals', \App\Http\Controllers\Accounting\JournalEntryController::class);
        Route::get('general-ledger', [\App\Http\Controllers\Accounting\GeneralLedgerController::class, 'index'])->name('general-ledger');
        Route::get('cashbook', [\App\Http\Controllers\Accounting\CashbookController::class, 'index'])->name('cashbook');

        // Bank Accounts
        Route::resource('bank-accounts', \App\Http\Controllers\Accounting\BankAccountController::class);
        Route::get('bank-accounts/{bankAccount}/reconciliation', [\App\Http\Controllers\Accounting\BankAccountController::class, 'reconciliation'])->name('bank-accounts.reconciliation');
        Route::get('bank-accounts/{bankAccount}/statement', [\App\Http\Controllers\Accounting\BankAccountController::class, 'statement'])->name('bank-accounts.statement');
    });

    // Reporting Module
    Route::prefix('reporting')->name('reporting.')->middleware('permission:reports.view')->group(function () {
        Route::get('/', [\App\Http\Controllers\Reporting\ReportController::class, 'index'])->name('index');
        Route::get('/sales', [\App\Http\Controllers\Reporting\ReportController::class, 'sales'])->name('sales');
        Route::get('/stock', [\App\Http\Controllers\Reporting\ReportController::class, 'stock'])->name('stock');
    });

    // Financial Reports Module
    Route::prefix('reports')->name('reports.')->middleware('permission:reports.view')->group(function () {
        Route::get('/', [\App\Http\Controllers\ReportController::class, 'index'])->name('index');
        Route::get('/profit-and-loss', [\App\Http\Controllers\ReportController::class, 'profitAndLoss'])->name('profit-and-loss');
        Route::get('/balance-sheet', [\App\Http\Controllers\ReportController::class, 'balanceSheet'])->name('balance-sheet');
        Route::get('/trial-balance', [\App\Http\Controllers\ReportController::class, 'trialBalance'])->name('trial-balance');
        Route::get('/ar-aging', [\App\Http\Controllers\ReportController::class, 'arAging'])->name('ar-aging');
        Route::get('/ap-aging', [\App\Http\Controllers\ReportController::class, 'apAging'])->name('ap-aging');
        Route::get('/inventory-valuation', [\App\Http\Controllers\ReportController::class, 'inventoryValuation'])->name('inventory-valuation');
        Route::get('/sst-summary', [\App\Http\Controllers\ReportController::class, 'sstSummary'])->name('sst-summary');
        Route::get('/audit-trail', [\App\Http\Controllers\ReportController::class, 'auditTrail'])->name('audit-trail');
    });

    // e-Invoice Module
    Route::prefix('einvoice')->name('einvoice.')->middleware('permission:sales.view')->group(function () {
        Route::get('/', [\App\Http\Controllers\EInvoiceController::class, 'index'])->name('index');
        Route::get('/settings', [\App\Http\Controllers\EInvoiceController::class, 'settings'])->name('settings');
        Route::post('/settings', [\App\Http\Controllers\EInvoiceController::class, 'updateSettings'])->middleware('permission:settings.edit')->name('settings.update');
        Route::get('/{document}', [\App\Http\Controllers\EInvoiceController::class, 'show'])->name('show');
        Route::post('/prepare/{invoice}', [\App\Http\Controllers\EInvoiceController::class, 'prepare'])->name('prepare');
        Route::post('/submit/{document}', [\App\Http\Controllers\EInvoiceController::class, 'submit'])->name('submit');
        Route::post('/batch-submit', [\App\Http\Controllers\EInvoiceController::class, 'batchSubmit'])->name('batch-submit');
        Route::post('/check-status/{document}', [\App\Http\Controllers\EInvoiceController::class, 'checkStatus'])->name('check-status');
        Route::post('/cancel/{document}', [\App\Http\Controllers\EInvoiceController::class, 'cancel'])->name('cancel');
    });

    // Module Root Redirects
    Route::redirect('/sales', '/sales/invoices');
    Route::redirect('/purchase', '/purchase/invoices');
    Route::redirect('/accounting', '/accounting/journals');
    Route::redirect('/inventory', '/inventory/products');
    Route::redirect('/settings', '/master/settings');
    Route::redirect('/users', '/master/users');

    // Inventory Module
    Route::prefix('inventory')->name('inventory.')->middleware('permission:inventory.view')->group(function () {
         Route::resource('products', \App\Http\Controllers\Master\ProductController::class);
         Route::resource('categories', \App\Http\Controllers\Master\ProductCategoryController::class)->parameters(['categories' => 'category']);
         Route::get('movements', function () { return Inertia::render('Inventory/Movements/Index'); })->name('movements.index');
    });

    // Audit Logs (Admin only)
    Route::prefix('audit-logs')->name('audit-logs.')->middleware('permission:audit-log.view')->group(function () {
        Route::get('/', [\App\Http\Controllers\AuditLogController::class, 'index'])->name('index');
        Route::get('/export', [\App\Http\Controllers\AuditLogController::class, 'export'])->middleware('permission:audit-log.export')->name('export');
        Route::get('/{auditLog}', [\App\Http\Controllers\AuditLogController::class, 'show'])->name('show');
    });

    // Master Data / Settings
    Route::prefix('master')->name('master.')->group(function () {
        // Settings - requires settings permission
        Route::get('settings', [\App\Http\Controllers\Master\SettingsController::class, 'index'])->middleware('permission:settings.view')->name('settings.index');
        Route::post('settings', [\App\Http\Controllers\Master\SettingsController::class, 'update'])->middleware('permission:settings.edit')->name('settings.update');




        // User management - requires users permission
        Route::resource('users', \App\Http\Controllers\Master\TenantUserController::class)->middleware('permission:users.view');

        // Customer/Product management - part of sales/inventory
        Route::resource('customers', \App\Http\Controllers\Master\CustomerController::class)->middleware('permission:sales.view');
        Route::resource('products', \App\Http\Controllers\Master\ProductController::class)->middleware('permission:inventory.view');
        Route::resource('categories', \App\Http\Controllers\Master\ProductCategoryController::class)->parameters(['categories' => 'category'])->middleware('permission:inventory.view');
    });

    // Super Admin Routes
    Route::prefix('admin')->name('admin.')->middleware('super-admin')->group(function () {
        // Admin Dashboard
        Route::get('/', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('dashboard');

        // SMTP Settings
        Route::get('/settings/smtp', [\App\Http\Controllers\Admin\SmtpSettingsController::class, 'index'])->name('settings.smtp');
        Route::post('/settings/smtp', [\App\Http\Controllers\Admin\SmtpSettingsController::class, 'update'])->name('settings.smtp.update');
        Route::post('/settings/smtp/test', [\App\Http\Controllers\Admin\SmtpSettingsController::class, 'test'])->name('settings.smtp.test');

        // Email Templates
        Route::get('/email-templates', [\App\Http\Controllers\Admin\EmailTemplateController::class, 'index'])->name('email-templates.index');
        Route::get('/email-templates/{emailTemplate}/edit', [\App\Http\Controllers\Admin\EmailTemplateController::class, 'edit'])->name('email-templates.edit');
        Route::put('/email-templates/{emailTemplate}', [\App\Http\Controllers\Admin\EmailTemplateController::class, 'update'])->name('email-templates.update');
        Route::get('/email-templates/{emailTemplate}/preview', [\App\Http\Controllers\Admin\EmailTemplateController::class, 'preview'])->name('email-templates.preview');
        Route::post('/email-templates/{emailTemplate}/reset', [\App\Http\Controllers\Admin\EmailTemplateController::class, 'reset'])->name('email-templates.reset');

        // Payment Gateway Settings
        Route::get('/settings/payment-gateways', [\App\Http\Controllers\Admin\PaymentGatewayController::class, 'index'])->name('settings.payment-gateways');
        Route::get('/settings/payment-gateways/{gateway}/edit', [\App\Http\Controllers\Admin\PaymentGatewayController::class, 'edit'])->name('settings.payment-gateways.edit');
        Route::patch('/settings/payment-gateways/{gateway}', [\App\Http\Controllers\Admin\PaymentGatewayController::class, 'update'])->name('settings.payment-gateways.update');
        Route::post('/settings/payment-gateways/{gateway}/toggle', [\App\Http\Controllers\Admin\PaymentGatewayController::class, 'toggle'])->name('settings.payment-gateways.toggle');
        Route::post('/settings/payment-gateways/{gateway}/test', [\App\Http\Controllers\Admin\PaymentGatewayController::class, 'test'])->name('settings.payment-gateways.test');

        // Subscription Plans
        Route::get('/subscription-plans', [\App\Http\Controllers\Admin\SubscriptionPlanController::class, 'index'])->name('subscription-plans.index');
        Route::get('/subscription-plans/create', [\App\Http\Controllers\Admin\SubscriptionPlanController::class, 'create'])->name('subscription-plans.create');
        Route::post('/subscription-plans', [\App\Http\Controllers\Admin\SubscriptionPlanController::class, 'store'])->name('subscription-plans.store');
        Route::get('/subscription-plans/{subscriptionPlan}/edit', [\App\Http\Controllers\Admin\SubscriptionPlanController::class, 'edit'])->name('subscription-plans.edit');
        Route::patch('/subscription-plans/{subscriptionPlan}', [\App\Http\Controllers\Admin\SubscriptionPlanController::class, 'update'])->name('subscription-plans.update');
        Route::post('/subscription-plans/{subscriptionPlan}/toggle', [\App\Http\Controllers\Admin\SubscriptionPlanController::class, 'toggle'])->name('subscription-plans.toggle');
        Route::delete('/subscription-plans/{subscriptionPlan}', [\App\Http\Controllers\Admin\SubscriptionPlanController::class, 'destroy'])->name('subscription-plans.destroy');

        // Subscription Management
        Route::post('/subscriptions/{subscription}/resume', [\App\Http\Controllers\Admin\SubscriptionController::class, 'resume'])->name('subscriptions.resume');
        Route::post('/subscriptions/{subscription}/extend', [\App\Http\Controllers\Admin\SubscriptionController::class, 'extend'])->name('subscriptions.extend');
        Route::resource('subscriptions', \App\Http\Controllers\Admin\SubscriptionController::class)->only(['index', 'update', 'destroy']);
        Route::resource('transactions', \App\Http\Controllers\Admin\TransactionController::class)->only(['index']);

        // User Management
        Route::get('/users', [\App\Http\Controllers\Admin\UserManagementController::class, 'index'])->name('users.index');
        Route::get('/users/{user}', [\App\Http\Controllers\Admin\UserManagementController::class, 'show'])->name('users.show');
        Route::get('/users/{user}/edit', [\App\Http\Controllers\Admin\UserManagementController::class, 'edit'])->name('users.edit');
        Route::patch('/users/{user}', [\App\Http\Controllers\Admin\UserManagementController::class, 'update'])->name('users.update');
        Route::post('/users/{user}/ban', [\App\Http\Controllers\Admin\UserManagementController::class, 'ban'])->name('users.ban');
        Route::post('/users/{user}/unban', [\App\Http\Controllers\Admin\UserManagementController::class, 'unban'])->name('users.unban');
        Route::post('/users/{user}/toggle', [\App\Http\Controllers\Admin\UserManagementController::class, 'toggle'])->name('users.toggle');
        Route::post('/users/{user}/subscription', [\App\Http\Controllers\Admin\UserManagementController::class, 'assignSubscription'])->name('users.subscription.assign');
        Route::delete('/users/{user}/subscription', [\App\Http\Controllers\Admin\UserManagementController::class, 'cancelSubscription'])->name('users.subscription.cancel');
        Route::post('/users/{user}/impersonate', [\App\Http\Controllers\Admin\UserManagementController::class, 'impersonate'])->name('users.impersonate');
        Route::delete('/users/{user}', [\App\Http\Controllers\Admin\UserManagementController::class, 'destroy'])->name('users.destroy');
    });

    // Stop Impersonation (outside admin group so impersonated users can access)
    Route::post('/stop-impersonating', [\App\Http\Controllers\Admin\UserManagementController::class, 'stopImpersonating'])->name('stop-impersonating');
});

require __DIR__.'/auth.php';
