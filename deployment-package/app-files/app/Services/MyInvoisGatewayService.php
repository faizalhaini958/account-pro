<?php

namespace App\Services;

use App\Models\EInvoiceDocument;
use Illuminate\Support\Str;
use App\Services\TenantContext;

/**
 * Mock implementation of MyInvois API Gateway
 * Replace with actual API integration in production
 */
class MyInvoisGatewayService
{
    protected string $baseUrl;
    protected string $clientId;
    protected string $clientSecret;
    protected bool $sandboxMode;
    
    public function __construct()
    {
        $tenant = TenantContext::getTenant();
        $this->sandboxMode = $tenant?->myinvois_sandbox_mode ?? true;
        $this->baseUrl = $this->sandboxMode 
            ? 'https://preprod-api.myinvois.hasil.gov.my'
            : 'https://api.myinvois.hasil.gov.my';
        $this->clientId = $tenant?->myinvois_client_id ?? '';
        $this->clientSecret = $tenant?->myinvois_client_secret ?? '';
    }
    
    /**
     * Submit e-Invoice to MyInvois
     * MOCK: Returns simulated success response
     */
    public function submitDocument(EInvoiceDocument $document): array
    {
        // In production, this would make actual API call
        // For now, simulate successful submission
        
        sleep(1); // Simulate API delay
        
        // Generate mock UUID
        $uuid = Str::uuid()->toString();
        
        // Update document with UUID and status
        $document->update([
            'uuid' => $uuid,
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);
        
        return [
            'success' => true,
            'uuid' => $uuid,
            'status' => 'submitted',
            'message' => 'Document submitted successfully (MOCK)',
            'submission_uid' => 'SUB-' . Str::random(10),
            'long_id' => 'LONG-' . Str::random(20),
        ];
    }
    
    /**
     * Check submission status
     * MOCK: Returns validated status after a delay
     */
    public function checkStatus(string $uuid): array
    {
        $document = EInvoiceDocument::where('uuid', $uuid)->first();
        
        if (!$document) {
            return [
                'success' => false,
                'message' => 'Document not found',
            ];
        }
        
        // Simulate validation after 5 minutes
        $minutesSinceSubmission = $document->submitted_at?->diffInMinutes(now()) ?? 0;
        
        if ($minutesSinceSubmission >= 5) {
            $status = 'validated';
            $document->update([
                'status' => $status,
                'validated_at' => now(),
            ]);
        } else {
            $status = 'submitted';
        }
        
        return [
            'success' => true,
            'uuid' => $uuid,
            'status' => $status,
            'validation_steps' => [
                ['step' => 'Schema Validation', 'status' => 'passed'],
                ['step' => 'Business Rules', 'status' => 'passed'],
                ['step' => 'Digital Signature', 'status' => $status === 'validated' ? 'passed' : 'pending'],
            ],
        ];
    }
    
    /**
     * Cancel e-Invoice
     * MOCK: Simulates cancellation
     */
    public function cancelDocument(string $uuid, string $reason): array
    {
        $document = EInvoiceDocument::where('uuid', $uuid)->first();
        
        if (!$document) {
            return [
                'success' => false,
                'message' => 'Document not found',
            ];
        }
        
        if (!in_array($document->status, ['submitted', 'validated'])) {
            return [
                'success' => false,
                'message' => 'Document cannot be cancelled in current status',
            ];
        }
        
        $document->update([
            'status' => 'cancelled',
            'validation_errors' => 'Cancelled: ' . $reason,
        ]);
        
        return [
            'success' => true,
            'uuid' => $uuid,
            'status' => 'cancelled',
            'message' => 'Document cancelled successfully (MOCK)',
        ];
    }
    
    /**
     * Get document details
     * MOCK: Returns document data
     */
    public function getDocument(string $uuid): array
    {
        $document = EInvoiceDocument::where('uuid', $uuid)->first();
        
        if (!$document) {
            return [
                'success' => false,
                'message' => 'Document not found',
            ];
        }
        
        return [
            'success' => true,
            'uuid' => $uuid,
            'status' => $document->status,
            'data' => $document->einvoice_data,
            'submitted_at' => $document->submitted_at?->toIso8601String(),
            'validated_at' => $document->validated_at?->toIso8601String(),
        ];
    }
    
    /**
     * Authenticate with MyInvois API
     * MOCK: Returns fake token
     */
    protected function authenticate(): string
    {
        // In production, this would call the OAuth endpoint
        return 'mock_bearer_token_' . Str::random(40);
    }
    
    /**
     * Check if service is configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->clientId) && !empty($this->clientSecret);
    }
}
