<?php

namespace Database\Factories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::first()->id ?? 1, // Fallback for dev
            'name' => fake()->company(),
            'tax_id' => fake()->numerify('#######-X'),
            'email' => fake()->companyEmail(),
            'phone' => fake()->phoneNumber(),
            'billing_address' => fake()->address(),
            'shipping_address' => fake()->address(),
            'company_name' => fake()->company(),
            'price_tier' => 'retail',
            'credit_limit' => fake()->numberBetween(1000, 50000),
            'credit_days' => 30,
        ];
    }
}
