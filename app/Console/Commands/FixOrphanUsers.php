<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class FixOrphanUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:fix-orphans {--dry-run : Show what would be done without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create tenants for users who registered but have no tenant/role assigned';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        // Find users without any tenant
        $orphanUsers = User::whereDoesntHave('tenants')->get();

        if ($orphanUsers->isEmpty()) {
            $this->info('No orphan users found.');
            return Command::SUCCESS;
        }

        $this->info("Found {$orphanUsers->count()} orphan user(s).");

        // Get the Owner role
        $ownerRole = Role::where('slug', 'owner')->first();
        if (!$ownerRole) {
            $this->error('Owner role not found. Please run the RoleSeeder first.');
            return Command::FAILURE;
        }

        foreach ($orphanUsers as $user) {
            $this->line("Processing: {$user->name} ({$user->email})");

            if ($dryRun) {
                $this->info("  [DRY RUN] Would create tenant and assign Owner role");
                continue;
            }

            // Create a tenant for this user
            $companyName = $user->name . "'s Company";
            $tenant = Tenant::create([
                'name' => $companyName,
                'slug' => Str::slug($companyName) . '-' . Str::random(6),
                'email' => $user->email,
                'is_active' => true,
                'currency' => 'MYR',
                'financial_year_start' => now()->startOfYear(),
            ]);

            // Attach user to tenant with Owner role
            $tenant->users()->attach($user->id, [
                'role_id' => $ownerRole->id,
                'is_active' => true,
            ]);

            $this->info("  Created tenant '{$companyName}' and assigned Owner role");
        }

        $this->newLine();
        $this->info('Done!');

        return Command::SUCCESS;
    }
}
