<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Tenant;
use App\Services\InventoryService;
use App\Services\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;

class InventoryServiceTest extends TestCase
{
    use RefreshDatabase;

    private InventoryService $inventoryService;
    private Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();
        $this->inventoryService = new InventoryService();
        
        $this->tenant = Tenant::factory()->create();
        TenantContext::setTenant($this->tenant);
    }

    public function test_stock_in_increases_quantity_and_updates_average_cost()
    {
        $product = Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'current_stock' => 0,
            'purchase_cost' => 0,
        ]);

        // First purchase: 10 units @ $10
        $this->inventoryService->stockIn($product->refresh(), 10, 10.00, 'PO-001');

        $product->refresh();
        $this->assertEquals(10, $product->current_stock);
        $this->assertEquals(10.00, $product->purchase_cost);

        // Second purchase: 10 units @ $20
        $this->inventoryService->stockIn($product, 10, 20.00, 'PO-002');

        $product->refresh();
        $this->assertEquals(20, $product->current_stock);
        // Average cost: ((10*10) + (10*20)) / 20 = (100 + 200) / 20 = 15
        $this->assertEquals(15.00, $product->purchase_cost);
    }

    public function test_stock_out_uses_fifo_logic()
    {
        $product = Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'current_stock' => 0,
        ]);

        // Layer 1: 10 units @ $10
        $this->inventoryService->stockIn($product, 10, 10.00, 'PO-001');
        // Layer 2: 5 units @ $20
        $this->inventoryService->stockIn($product, 5, 20.00, 'PO-002');

        // Sell 12 units
        // Should take 10 from Layer 1 ($100) + 2 from Layer 2 ($40) = $140 total COGS
        $result = $this->inventoryService->stockOut($product, 12, 'INV-001');

        $this->assertEquals(140.00, $result['cogs']);
        
        $product->refresh();
        $this->assertEquals(3, $product->current_stock); // 15 - 12
        
        // Remaining stock valuation: 3 units @ $20
        $valuation = $this->inventoryService->getValuation($product);
        $this->assertEquals(60.00, $valuation['value']); 
    }

    public function test_get_valuation_calculates_correctly()
    {
        $product = Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'current_stock' => 0,
        ]);

        $this->inventoryService->stockIn($product, 10, 10.00, 'PO-001');
        $this->inventoryService->stockIn($product, 10, 20.00, 'PO-002');

        $valuation = $this->inventoryService->getValuation($product);

        $this->assertEquals(20, $valuation['quantity']);
        $this->assertEquals(300.00, $valuation['value']); // (10*10) + (10*20)
        $this->assertEquals(15.00, $valuation['average_cost']);
    }
}
