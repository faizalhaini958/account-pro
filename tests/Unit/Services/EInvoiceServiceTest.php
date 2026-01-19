<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\EInvoiceService;
use App\Models\Tenant;
use App\Models\Customer;
use App\Services\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;

class EInvoiceServiceTest extends TestCase
{
    use RefreshDatabase;

    private EInvoiceService $eInvoiceService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->eInvoiceService = new EInvoiceService();
    }

    public function test_prepare_einvoice_success()
    {
        $tenant = Tenant::factory()->create([
            'sst_enabled' => true,
            'einvoice_config' => ['tin' => 'T1234567890', 'brn' => '123456-X'],
        ]);
        
        // Populate tenant data for valid e-Invoice
        $tenant->update([
            'city' => 'Kuala Lumpur',
            'state' => '14', // W.P. Kuala Lumpur code
            'postcode' => '50000',
            'email' => 'admin@tenant.com',
            'phone' => '+60123456789',
        ]);
        // Mock accessors if needed, but model fields are direct in Service
        // Need to ensure Tenant model accessors for 'tin', 'brn' work or are fields
        // Checking Service: $tenant->tin. If it's in settings array, service might fail if no accessor.
        // I will check the Service logic again. 
        // Logic: $tenant->tin. Database doesn't have 'tin' column. It has 'einvoice_config'.
        // So Tenant model MUST have an accessor for 'tin'.
        
        TenantContext::setTenant($tenant);

        $customer = Customer::factory()->create([
            'tenant_id' => $tenant->id,
            'einvoice_data' => ['tin' => 'C9876543210', 'id_number' => '900101-14-1234', 'id_type' => 'NRIC'],
        ]);
        // Same for Customer: $invoice->customer->tin. Need key accessor.

        $invoice = \App\Models\Invoice::factory()->create([
            'tenant_id' => $tenant->id,
            'customer_id' => $customer->id,
            'status' => 'posted',
            'total' => 106.00,
            'subtotal' => 100.00,
            'tax_amount' => 6.00,
        ]);

        \App\Models\InvoiceItem::create([
            'invoice_id' => $invoice->id,
            'description' => 'Test Item',
            'quantity' => 1,
            'unit_price' => 100.00,
            'total' => 100.00,
            'amount' => 100.00,
            'sort_order' => 1,
        ]);

        // I suspect Tenant and Customer models miss accessors for TIN/BRN.
        // If so, the test will fail, and I will fix the models.
        
        $document = $this->eInvoiceService->prepareEInvoice($invoice);

        $this->assertEquals('invoice', $document->document_type);
        $this->assertEquals('prepared', $document->status);
        
        // Assert creation
        $this->assertDatabaseHas('einvoice_documents', [
            'invoice_id' => $invoice->id,
            'status' => 'prepared'
        ]);

        // Assert QR Code generated
        $invoice->refresh();
        $this->assertNotNull($invoice->einvoice_qr_code);
        $this->assertStringStartsWith('<?xml', $invoice->einvoice_qr_code); // SVG usually starts with xml or svg tag
        $this->assertStringContainsString('<svg', $invoice->einvoice_qr_code);
    }
}
