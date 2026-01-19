<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class EmailTemplateController extends Controller
{
    /**
     * Display a listing of email templates.
     */
    public function index(Request $request): Response
    {
        $category = $request->get('category');

        $templates = EmailTemplate::query()
            ->when($category, fn($q) => $q->where('category', $category))
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        $categories = EmailTemplate::distinct()->pluck('category');

        return Inertia::render('Admin/EmailTemplates/Index', [
            'templates' => $templates,
            'categories' => $categories,
            'currentCategory' => $category,
        ]);
    }

    /**
     * Show the form for editing the specified email template.
     */
    public function edit(EmailTemplate $emailTemplate): Response
    {
        return Inertia::render('Admin/EmailTemplates/Edit', [
            'template' => $emailTemplate,
        ]);
    }

    /**
     * Update the specified email template.
     */
    public function update(Request $request, EmailTemplate $emailTemplate): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:500',
            'content' => 'required|string',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $emailTemplate->update($validated);

        return redirect()->route('admin.email-templates.index')
            ->with('success', 'Email template updated successfully.');
    }

    /**
     * Preview the email template.
     */
    public function preview(EmailTemplate $emailTemplate): Response
    {
        // Generate sample data for preview
        $sampleData = $this->getSampleData($emailTemplate->key);

        return Inertia::render('Admin/EmailTemplates/Preview', [
            'template' => $emailTemplate,
            'renderedContent' => $emailTemplate->render($sampleData),
            'renderedSubject' => $emailTemplate->renderSubject($sampleData),
        ]);
    }

    /**
     * Reset template to default.
     */
    public function reset(EmailTemplate $emailTemplate): RedirectResponse
    {
        // Get default template from seeder
        $defaults = $this->getDefaultTemplates();
        $default = collect($defaults)->firstWhere('key', $emailTemplate->key);

        if ($default) {
            $emailTemplate->update([
                'subject' => $default['subject'],
                'content' => $default['content'],
            ]);

            return redirect()->back()
                ->with('success', 'Template reset to default successfully.');
        }

        return redirect()->back()
            ->with('error', 'Default template not found.');
    }

    /**
     * Get sample data for preview
     */
    private function getSampleData(string $key): array
    {
        $baseData = [
            'app_name' => config('app.name'),
            'app_url' => config('app.url'),
        ];

        return match ($key) {
            'verify-email' => array_merge($baseData, [
                'user_name' => 'John Doe',
                'verification_url' => config('app.url') . '/verify-email/sample-token',
            ]),
            'reset-password' => array_merge($baseData, [
                'reset_url' => config('app.url') . '/reset-password/sample-token',
            ]),
            'trial-started' => array_merge($baseData, [
                'user_name' => 'John Doe',
                'plan_name' => 'Professional Plan',
                'trial_end_date' => now()->addDays(14)->format('F j, Y'),
                'price' => 'RM 99.00',
                'billing_cycle' => 'monthly',
            ]),
            'trial-ending' => array_merge($baseData, [
                'user_name' => 'John Doe',
                'plan_name' => 'Professional Plan',
                'days_remaining' => '3',
                'trial_end_date' => now()->addDays(3)->format('F j, Y g:i A'),
                'next_payment_amount' => 'RM 99.00',
                'next_payment_date' => now()->addDays(3)->format('F j, Y'),
            ]),
            'payment-successful' => array_merge($baseData, [
                'user_name' => 'John Doe',
                'transaction_id' => 'TXN-2026-0001',
                'amount' => 'RM 99.00',
                'payment_date' => now()->format('F j, Y g:i A'),
                'plan_name' => 'Professional Plan',
                'next_billing_date' => now()->addMonth()->format('F j, Y'),
            ]),
            'payment-failed' => array_merge($baseData, [
                'user_name' => 'John Doe',
                'amount' => 'RM 99.00',
                'reason' => 'Insufficient funds',
                'retry_date' => now()->addDays(3)->format('F j, Y'),
            ]),
            'subscription-expired' => array_merge($baseData, [
                'user_name' => 'John Doe',
                'plan_name' => 'Professional Plan',
                'expiry_date' => now()->format('F j, Y'),
            ]),
            'invoice-sent' => array_merge($baseData, [
                'customer_name' => 'ABC Corporation',
                'invoice_number' => 'INV-2026-0001',
                'invoice_date' => now()->format('F j, Y'),
                'due_date' => now()->addDays(30)->format('F j, Y'),
                'total_amount' => 'RM 1,250.00',
                'currency' => 'MYR',
            ]),
            'payment-reminder' => array_merge($baseData, [
                'customer_name' => 'ABC Corporation',
                'invoice_number' => 'INV-2026-0001',
                'invoice_date' => now()->subDays(37)->format('F j, Y'),
                'due_date' => now()->subDays(7)->format('F j, Y'),
                'days_overdue' => '7',
                'amount_due' => 'RM 1,250.00',
                'currency' => 'MYR',
            ]),
            'einvoice-submitted' => array_merge($baseData, [
                'invoice_number' => 'INV-2026-0001',
                'uuid' => 'ABC123-DEF456-GHI789',
                'submission_id' => 'SUB-2026-0001',
                'status' => 'Submitted',
                'submitted_at' => now()->format('F j, Y g:i A'),
            ]),
            'einvoice-validated' => array_merge($baseData, [
                'invoice_number' => 'INV-2026-0001',
                'uuid' => 'ABC123-DEF456-GHI789',
                'validated_at' => now()->format('F j, Y g:i A'),
            ]),
            'einvoice-rejected' => array_merge($baseData, [
                'invoice_number' => 'INV-2026-0001',
                'uuid' => 'ABC123-DEF456-GHI789',
                'status' => 'Rejected',
                'error_message' => 'Invalid TIN number format',
            ]),
            default => $baseData,
        };
    }

    /**
     * Get default templates (same as seeder)
     */
    private function getDefaultTemplates(): array
    {
        return [
            // Will be populated with defaults - placeholder for now
            // In practice, this would load from the seeder or a config file
        ];
    }
}
