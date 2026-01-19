<?php

namespace Database\Factories;

use App\Models\ChartOfAccount;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class ChartOfAccountFactory extends Factory
{
    protected $model = ChartOfAccount::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'code' => $this->faker->unique()->numerify('####'),
            'name' => $this->faker->word . ' Account',
            'type' => $this->faker->randomElement(['asset', 'liability', 'equity', 'revenue', 'expense']),
            'is_system' => false,
            'is_active' => true,
        ];
    }
}
