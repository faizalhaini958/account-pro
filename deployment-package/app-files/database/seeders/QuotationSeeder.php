<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Quotation;
use App\Models\QuotationItem;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class QuotationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Disable foreign key checks
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        QuotationItem::truncate();
        Quotation::truncate();
        Product::truncate();
        Customer::truncate();

        // Enable foreign key checks
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $tenantId = Tenant::first()->id ?? 1;

        // Ensure we have some customers and products
        $customers = Customer::factory()->count(10)->create(['tenant_id' => $tenantId]);
        $products = Product::factory()->count(20)->create(['tenant_id' => $tenantId]);

        // Create Quotations
        Quotation::factory()
            ->count(30)
            ->recycle($customers)
            ->create(['tenant_id' => $tenantId])
            ->each(function ($quotation) use ($products) {
                // Add Items to Quotation
                $items = QuotationItem::factory()
                    ->count(rand(1, 5))
                    ->recycle($products)
                    ->make([
                        'quotation_id' => $quotation->id,
                    ]);
                
                $quotation->items()->saveMany($items);

                // Update Quotation Totals
                $subtotal = $items->sum('total');
                $quotation->update([
                    'subtotal' => $subtotal,
                    'total' => $subtotal, // Assuming no tax for simplicity in seeder for now
                ]);
            });
    }
}
