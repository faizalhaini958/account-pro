<?php

namespace Database\Factories;

use App\Models\BankAccount;
use App\Models\Tenant;
use App\Models\ChartOfAccount;
use Illuminate\Database\Eloquent\Factories\Factory;

class BankAccountFactory extends Factory
{
    protected $model = BankAccount::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'account_id' => ChartOfAccount::factory(),
            'name' => $this->faker->word . ' Account',
            'bank_name' => $this->faker->company . ' Bank',
            'account_number' => $this->faker->bankAccountNumber,
            'account_type' => 'Current',
        ];
    }
}
