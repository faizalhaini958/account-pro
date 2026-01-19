<?php

namespace App\Traits;

use App\Models\EmailTemplate;
use Illuminate\Notifications\Messages\MailMessage;

trait RendersEmailTemplate
{
    /**
     * Render email from database template
     */
    protected function renderEmailFromTemplate(string $templateKey, array $data): MailMessage
    {
        $template = EmailTemplate::getByKey($templateKey);

        if (!$template) {
            // Fallback to default if template not found
            return $this->fallbackMessage($templateKey, $data);
        }

        $subject = $template->renderSubject($data);
        $content = $template->render($data);

        // Wrap content with email layout
        $wrappedContent = view('emails.layout-content', [
            'content' => $content,
            'subject' => $subject,
        ])->render();

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.template-wrapper', [
                'content' => $wrappedContent,
            ]);
    }

    /**
     * Fallback message if template not found
     */
    abstract protected function fallbackMessage(string $templateKey, array $data): MailMessage;
}
