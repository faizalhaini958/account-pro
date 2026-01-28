<?php

namespace App\Notifications;

use App\Traits\RendersEmailTemplate;
use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmail extends BaseVerifyEmail
{
    use RendersEmailTemplate;

    /**
     * Build the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return $this->renderEmailFromTemplate('verify-email', [
            'user_name' => $notifiable->name,
            'verification_url' => $verificationUrl,
            'app_name' => config('app.name'),
            'app_url' => config('app.url'),
        ]);
    }

    /**
     * Fallback message if template not found
     */
    protected function fallbackMessage(string $templateKey, array $data): MailMessage
    {
        return (new MailMessage)
            ->subject('Verify Your Email Address - BukuKira')
            ->view('emails.auth.verify-email', [
                'user' => (object)['name' => $data['user_name']],
                'verificationUrl' => $data['verification_url'],
            ]);
    }
}
