<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Quotation>
 */
class QuotationFactory extends Factory
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
            'customer_id' => Customer::factory(),
            'number' => fake()->unique()->bothify('QT-2026-####'),
            'date' => fake()->dateTimeBetween('-1 month', 'now'),
            'valid_until' => fake()->dateTimeBetween('now', '+1 month'),
            'status' => fake()->randomElement(['draft', 'sent', 'accepted', 'rejected']),
            'total' => 0, // Will be calculated
            'subtotal' => 0,
            'tax_amount' => 0,
            'terms' => fake()->paragraph(),
            'notes' => fake()->sentence(),
        ];
    }
}
