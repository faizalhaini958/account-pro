<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\SSTService;
use App\Services\TenantContext;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SSTServiceTest extends TestCase
{
    use RefreshDatabase;

    private SSTService $sstService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->sstService = new SSTService();
    }

    public function test_calculate_sst_standard_rate_registered_tenant()
    {
        $tenant = Tenant::factory()->create([
            'sst_enabled' => true,
            'sst_rate' => 6.00,
        ]);

        // Simulate tenant context
        TenantContext::setTenant($tenant);

        $result = $this->sstService->calculateSST(100.00);

        $this->assertEquals(6.00, $result['sst_amount']);
        $this->assertEquals(6.00, $result['sst_rate']);
        $this->assertEquals(106.00, $result['total']);
    }

    public function test_calculate_sst_custom_rate()
    {
        $tenant = Tenant::factory()->create([
            'sst_enabled' => true,
            'sst_rate' => 6.00,
        ]);

        TenantContext::setTenant($tenant);

        // Override with 10% rate for specific item
        $result = $this->sstService->calculateSST(100.00, 10.00);

        $this->assertEquals(10.00, $result['sst_amount']);
        $this->assertEquals(10.00, $result['sst_rate']);
        $this->assertEquals(110.00, $result['total']);
    }

    public function test_calculate_sst_not_registered()
    {
        $tenant = Tenant::factory()->create([
            'sst_enabled' => false,
        ]);

        TenantContext::setTenant($tenant);

        $result = $this->sstService->calculateSST(100.00);

        $this->assertEquals(0.00, $result['sst_amount']);
        $this->assertEquals(0.00, $result['sst_rate']);
        $this->assertEquals(100.00, $result['total']);
    }

    public function test_get_sst_payable()
    {
        $tenant = Tenant::factory()->create([
            'sst_enabled' => true,
        ]);

        TenantContext::setTenant($tenant);

        // Create Output Tax (Sales) - Tax Amount: 500
        \App\Models\Invoice::factory()->create([
            'tenant_id' => $tenant->id,
            'date' => now(),
            'status' => 'posted',
            'tax_amount' => 500.00,
            'total' => 5500.00,
        ]);

        // Create Input Tax (Purchases) - Tax Amount: 200
        \App\Models\PurchaseInvoice::factory()->create([
            'tenant_id' => $tenant->id,
            'date' => now(),
            'status' => 'posted',
            'tax_amount' => 200.00,
            'total' => 2200.00,
        ]);

        $startDate = now()->startOfMonth();
        $endDate = now()->endOfMonth();

        $result = $this->sstService->getSSTPayable($startDate, $endDate);

        $this->assertEquals(500.00, $result['output_tax']);
        $this->assertEquals(200.00, $result['input_tax']);
        $this->assertEquals(300.00, $result['net_payable']);
    }
}
