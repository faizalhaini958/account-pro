<?php

namespace Database\Factories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::first()->id ?? 1,
            'name' => fake()->words(3, true),
            'sku' => fake()->unique()->bothify('PROD-####'),
            'retail_price' => fake()->randomFloat(2, 10, 1000),
            'purchase_cost' => fake()->randomFloat(2, 5, 800),
            'type' => 'product', // or service
            'is_active' => true,
            'track_inventory' => true,
            'current_stock' => fake()->numberBetween(0, 100),
        ];
    }
}
