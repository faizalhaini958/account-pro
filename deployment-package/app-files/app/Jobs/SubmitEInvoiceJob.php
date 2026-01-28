<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\EInvoiceDocument;
use App\Services\MyInvoisGatewayService;

class SubmitEInvoiceJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public EInvoiceDocument $document;

    /**
     * Create a new job instance.
     */
    public function __construct(EInvoiceDocument $document)
    {
        $this->document = $document;
    }

    /**
     * Execute the job.
     */
    public function handle(MyInvoisGatewayService $gateway): void
    {
        // Don't submit if already submitted or validated
        if (in_array($this->document->status, ['submitted', 'validated', 'rejected', 'cancelled'])) {
            return;
        }

        try {
            $result = $gateway->submitDocument($this->document);

            // Log result or handle errors if mock result was failure
            if (!$result['success']) {
                $this->document->update([
                   'status' => 'rejected',
                   'validation_errors' => $result['message'] ?? 'Submission failed'
                ]);
            }
        } catch (\Exception $e) {
            $this->document->update([
                'status' => 'rejected',
                'validation_errors' => $e->getMessage()
            ]);
        }
    }
}
