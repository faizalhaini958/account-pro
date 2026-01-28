<?php

namespace Database\Factories;

use App\Models\PurchaseInvoice;
use App\Models\Supplier;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class PurchaseInvoiceFactory extends Factory
{
    protected $model = PurchaseInvoice::class;

    public function definition()
    {
        return [
            'tenant_id' => Tenant::factory(),
            'supplier_id' => Supplier::factory(),
            'number' => 'PINV-' . $this->faker->unique()->numberBetween(1000, 9999),
            'date' => now(),
            'due_date' => now()->addDays(30),
            'status' => 'draft',
            'subtotal' => 100.00,
            'tax_amount' => 0.00,
            'total' => 100.00,
        ];
    }
}
