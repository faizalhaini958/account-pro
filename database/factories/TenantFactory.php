<?php

namespace Database\Factories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class TenantFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Tenant::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->company,
            'slug' => $this->faker->unique()->slug,
            'is_active' => true,
            'financial_year_start' => now()->startOfYear(),
            'currency' => 'MYR',
            'sst_enabled' => false,
            'sst_rate' => 6.00,
            'settings' => [],
            'einvoice_config' => [],
        ];
    }
}
