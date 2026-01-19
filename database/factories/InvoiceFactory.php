<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Customer;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition()
    {
        return [
            'tenant_id' => Tenant::factory(),
            'customer_id' => Customer::factory(),
            'number' => 'INV-' . $this->faker->unique()->numberBetween(1000, 9999),
            'date' => now(),
            'due_date' => now()->addDays(30),
            'status' => 'draft',
            'subtotal' => 100.00,
            'tax_amount' => 0.00,
            'total' => 100.00,
        ];
    }
}
