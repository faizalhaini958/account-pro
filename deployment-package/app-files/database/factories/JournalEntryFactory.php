<?php

namespace Database\Factories;

use App\Models\JournalEntry;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class JournalEntryFactory extends Factory
{
    protected $model = JournalEntry::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'number' => 'JE-' . $this->faker->unique()->numberBetween(10000, 99999),
            'date' => now(),
            'description' => $this->faker->sentence,
            'reference_type' => 'App\Models\Invoice', // Default mock
            'reference_id' => 1,
            'status' => 'posted',
            'posted_at' => now(),
        ];
    }
}
