<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Service Products
        Product::create([
            'tenant_id' => 1,
            'name' => 'Consulting Service (Hourly)',
            'sku' => 'SVC-CONS-001',
            'type' => 'service',
            'retail_price' => 150.00,
            'purchase_cost' => 0.00,
            'description' => 'Professional consulting services per hour',
            'is_active' => true,
        ]);

        Product::create([
            'tenant_id' => 1,
            'name' => 'Web Development Package',
            'sku' => 'SVC-WEB-001',
            'type' => 'service',
            'retail_price' => 2500.00,
            'purchase_cost' => 0.00,
            'description' => 'Standard 5-page website development',
            'is_active' => true,
        ]);

        // Physical Products
        Product::create([
            'tenant_id' => 1,
            'name' => 'Wireless Mouse',
            'sku' => 'PHY-MOUSE-001',
            'type' => 'product', // Changed from physical to product
            'retail_price' => 45.00,
            'purchase_cost' => 25.00,
            'current_stock' => 100,
            'track_inventory' => true,
            'description' => 'Ergonomic wireless mouse',
            'is_active' => true,
        ]);

        Product::create([
            'tenant_id' => 1,
            'name' => 'Mechanical Keyboard',
            'sku' => 'PHY-KB-001',
            'type' => 'product',
            'retail_price' => 180.00,
            'purchase_cost' => 110.00,
            'current_stock' => 50,
            'track_inventory' => true,
            'description' => 'RGB Mechanical Keyboard',
            'is_active' => true,
        ]);

         Product::create([
            'tenant_id' => 1,
            'name' => 'USB-C Cable (2m)',
            'sku' => 'PHY-CABLE-001',
            'type' => 'product',
            'retail_price' => 25.00,
            'purchase_cost' => 8.00,
            'current_stock' => 200,
            'track_inventory' => true,
            'description' => 'Durable braided USB-C cable',
            'is_active' => true,
        ]);
    }
}
