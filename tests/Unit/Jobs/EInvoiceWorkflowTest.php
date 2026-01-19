<?php

namespace Tests\Unit\Jobs;

use Tests\TestCase;
use App\Jobs\SubmitEInvoiceJob;
use App\Models\EInvoiceDocument;
use App\Models\Tenant;
use App\Services\MyInvoisGatewayService;
use App\Services\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class EInvoiceWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_submit_job_calls_gateway()
    {
        $tenant = Tenant::factory()->create();
        TenantContext::setTenant($tenant);

        $customer = \App\Models\Customer::factory()->create(['tenant_id' => $tenant->id]);
        $invoice = \App\Models\Invoice::factory()->create(['tenant_id' => $tenant->id, 'customer_id' => $customer->id]);

        $document = EInvoiceDocument::create([
             'tenant_id' => $tenant->id,
             'invoice_id' => $invoice->id,
             'uuid' => null,
             'document_type' => 'invoice',
             'status' => 'prepared',
             'einvoice_data' => [],
        ]);
        
        $gateway = Mockery::mock(MyInvoisGatewayService::class);
        $gateway->shouldReceive('submitDocument')
            ->once()
            ->with($document)
            ->andReturn(['success' => true]);

        $job = new SubmitEInvoiceJob($document);
        $job->handle($gateway);
    }
    
    public function test_gateway_mock_submission_logic()
    {
        // Test the ACTUAL Mock Gateway logic inside MyInvoisGatewayService
        // (Since it simulates DB updates)
        
        $tenant = Tenant::factory()->create();
        TenantContext::setTenant($tenant);
        
        $customer = \App\Models\Customer::factory()->create(['tenant_id' => $tenant->id]);
        $invoice = \App\Models\Invoice::factory()->create(['tenant_id' => $tenant->id, 'customer_id' => $customer->id]);

        $document = EInvoiceDocument::create([
             'tenant_id' => $tenant->id,
             'invoice_id' => $invoice->id,
             'uuid' => null,
             'document_type' => 'invoice',
             'status' => 'prepared',
             'einvoice_data' => [],
        ]);
        
        $gateway = new MyInvoisGatewayService();
        $result = $gateway->submitDocument($document);
        
        $this->assertTrue($result['success']);
        $this->assertEquals('submitted', $result['status']);
        
        $document->refresh();
        $this->assertEquals('submitted', $document->status);
        $this->assertNotNull($document->uuid);
    }

    public function test_gateway_check_status_logic()
    {
        $tenant = Tenant::factory()->create();
        TenantContext::setTenant($tenant);
        
        $customer = \App\Models\Customer::factory()->create(['tenant_id' => $tenant->id]);
        $invoice = \App\Models\Invoice::factory()->create(['tenant_id' => $tenant->id, 'customer_id' => $customer->id]);

        // Submitted 1 minute ago (should still be 'submitted')
        $document = EInvoiceDocument::create([
             'tenant_id' => $tenant->id,
             'invoice_id' => $invoice->id,
             'uuid' => 'test-uuid-1',
             'status' => 'submitted',
             'submitted_at' => now()->subMinute(),
             'einvoice_data' => [],
        ]);
        
        $gateway = new MyInvoisGatewayService();
        $result = $gateway->checkStatus('test-uuid-1');
        
        $this->assertEquals('submitted', $result['status']);
        
        // Submitted 6 minutes ago (should become 'validated')
        $document->update(['submitted_at' => now()->subMinutes(6)]);
        
        $result = $gateway->checkStatus('test-uuid-1');
        $this->assertEquals('validated', $result['status']);
        
        $document->refresh();
        $this->assertEquals('validated', $document->status);
    }

    public function test_gateway_cancellation_logic()
    {
        $tenant = Tenant::factory()->create();
        TenantContext::setTenant($tenant);
        
        $customer = \App\Models\Customer::factory()->create(['tenant_id' => $tenant->id]);
        $invoice = \App\Models\Invoice::factory()->create(['tenant_id' => $tenant->id, 'customer_id' => $customer->id]);
        
        $document = EInvoiceDocument::create([
             'tenant_id' => $tenant->id,
             'invoice_id' => $invoice->id,
             'uuid' => 'test-uuid-2',
             'status' => 'submitted',
             'einvoice_data' => [],
        ]);
        
        $gateway = new MyInvoisGatewayService();
        $result = $gateway->cancelDocument('test-uuid-2', 'Correction needed');
        
        $this->assertTrue($result['success']);
        
        $document->refresh();
        $this->assertEquals('cancelled', $document->status);
        $this->assertStringContainsString('Correction needed', $document->validation_errors);
    }
}
