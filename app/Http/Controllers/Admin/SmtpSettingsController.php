<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class SmtpSettingsController extends Controller
{
    /**
     * Display SMTP settings
     */
    public function index()
    {
        $settings = SystemSetting::getGroup('smtp');

        return Inertia::render('Admin/Settings/Smtp', [
            'settings' => [
                'mail_driver' => $settings['mail_driver'] ?? 'smtp',
                'mail_host' => $settings['mail_host'] ?? '',
                'mail_port' => $settings['mail_port'] ?? 587,
                'mail_username' => $settings['mail_username'] ?? '',
                'mail_password' => isset($settings['mail_password']) && $settings['mail_password'] ? '********' : '',
                'mail_encryption' => $settings['mail_encryption'] ?? 'tls',
                'mail_from_address' => $settings['mail_from_address'] ?? '',
                'mail_from_name' => $settings['mail_from_name'] ?? config('app.name'),
            ],
        ]);
    }

    /**
     * Update SMTP settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'mail_driver' => 'required|string|in:smtp,sendmail,mailgun,ses,postmark,log',
            'mail_host' => 'required_if:mail_driver,smtp|nullable|string|max:255',
            'mail_port' => 'required_if:mail_driver,smtp|nullable|integer|min:1|max:65535',
            'mail_username' => 'nullable|string|max:255',
            'mail_password' => 'nullable|string|max:255',
            'mail_encryption' => 'nullable|string|in:tls,ssl,null',
            'mail_from_address' => 'required|email|max:255',
            'mail_from_name' => 'required|string|max:255',
        ]);

        // Don't update password if it's the placeholder
        if ($validated['mail_password'] === '********') {
            unset($validated['mail_password']);
        }

        $types = [
            'mail_driver' => 'string',
            'mail_host' => 'string',
            'mail_port' => 'integer',
            'mail_username' => 'string',
            'mail_password' => 'encrypted',
            'mail_encryption' => 'string',
            'mail_from_address' => 'string',
            'mail_from_name' => 'string',
        ];

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                SystemSetting::setValue('smtp', $key, $value, $types[$key] ?? 'string');
            }
        }

        return back()->with('success', 'SMTP settings updated successfully.');
    }

    /**
     * Test SMTP connection
     */
    public function test(Request $request)
    {
        $validated = $request->validate([
            'test_email' => 'required|email|max:255',
        ]);

        try {
            // Apply settings temporarily for testing
            $settings = SystemSetting::getGroup('smtp');

            config([
                'mail.default' => $settings['mail_driver'] ?? 'smtp',
                'mail.mailers.smtp.host' => $settings['mail_host'] ?? '',
                'mail.mailers.smtp.port' => $settings['mail_port'] ?? 587,
                'mail.mailers.smtp.username' => $settings['mail_username'] ?? '',
                'mail.mailers.smtp.password' => $settings['mail_password'] ?? '',
                'mail.mailers.smtp.encryption' => $settings['mail_encryption'] ?? 'tls',
                'mail.from.address' => $settings['mail_from_address'] ?? '',
                'mail.from.name' => $settings['mail_from_name'] ?? config('app.name'),
            ]);

            Mail::raw('This is a test email from AccountPro to verify SMTP settings.', function ($message) use ($validated, $settings) {
                $message->to($validated['test_email'])
                    ->from($settings['mail_from_address'] ?? config('mail.from.address'), $settings['mail_from_name'] ?? config('mail.from.name'))
                    ->subject('AccountPro - SMTP Test Email');
            });

            return back()->with('success', 'Test email sent successfully! Please check your inbox.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send test email: ' . $e->getMessage());
        }
    }
}
