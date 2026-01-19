<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Tenant;
use App\Models\Role;
use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use App\Models\Invoice;
use App\Services\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class SubscriptionLimitTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Tenant $tenant;
    private Role $ownerRole;

    protected function setUp(): void
    {
        parent::setUp();

        // Create subscription plans
        $this->seed(\Database\Seeders\SubscriptionPlanSeeder::class);

        // Create roles
        $this->ownerRole = Role::create(['name' => 'Owner', 'slug' => 'owner']);

        // Create user
        $this->user = User::factory()->create([
            'status' => 'active',
        ]);

        // Create tenant
        $this->tenant = Tenant::create([
            'name' => 'Test Company',
            'slug' => 'test-company',
            'is_active' => true,
        ]);

        $this->tenant->users()->attach($this->user->id, [
            'role_id' => $this->ownerRole->id,
            'is_active' => true,
        ]);

        $this->user->update(['current_tenant_id' => $this->tenant->id]);
    }

    /** @test */
    public function free_plan_user_cannot_create_more_than_one_company()
    {
        // Assign free plan
        $freePlan = SubscriptionPlan::where('code', 'free')->first();
        $this->createSubscription($this->user, $freePlan);

        $this->actingAs($this->user);

        // User already has 1 company (created in setUp)
        // Try to create a second company
        $response = $this->post(route('companies.store'), [
            'name' => 'Second Company',
            'email' => 'second@example.com',
        ]);

        $response->assertSessionHasErrors('error');
        $this->assertStringContainsString('maximum number of companies (1)', session('errors')->first('error'));

        // Verify company was not created
        $this->assertEquals(1, $this->user->tenants()->count());
    }

    /** @test */
    public function basic_plan_user_can_create_up_to_three_companies()
    {
        // Assign basic plan
        $basicPlan = SubscriptionPlan::where('code', 'basic')->first();
        $this->createSubscription($this->user, $basicPlan);

        $this->actingAs($this->user);

        // Create second company (user already has 1)
        $response = $this->post(route('companies.store'), [
            'name' => 'Second Company',
            'email' => 'second@example.com',
        ]);
        $response->assertRedirect(route('dashboard'));

        // Create third company
        $response = $this->post(route('companies.store'), [
            'name' => 'Third Company',
            'email' => 'third@example.com',
        ]);
        $response->assertRedirect(route('dashboard'));

        // Verify we now have 3 companies
        $this->assertEquals(3, $this->user->tenants()->count());

        // Try to create fourth company (should fail)
        $response = $this->post(route('companies.store'), [
            'name' => 'Fourth Company',
            'email' => 'fourth@example.com',
        ]);

        $response->assertSessionHasErrors('error');
        $this->assertStringContainsString('maximum number of companies (3)', session('errors')->first('error'));

        // Verify still only 3 companies
        $this->assertEquals(3, $this->user->tenants()->count());
    }

    /** @test */
    public function free_plan_user_cannot_add_more_than_one_user_per_company()
    {
        // Assign free plan
        $freePlan = SubscriptionPlan::where('code', 'free')->first();
        $this->createSubscription($this->user, $freePlan);

        $this->actingAs($this->user);
        TenantContext::setTenant($this->tenant);

        // Company already has 1 user (owner)
        // Try to add a second user
        $staffRole = Role::create(['name' => 'Staff', 'slug' => 'staff']);

        $response = $this->post(route('master.users.store'), [
            'name' => 'Second User',
            'email' => 'staff@example.com',
            'role_id' => $staffRole->id,
        ]);

        $response->assertSessionHasErrors('error');
        $this->assertStringContainsString('maximum number of users (1)', session('errors')->first('error'));

        // Verify user was not added
        $this->assertEquals(1, $this->tenant->users()->count());
    }

    /** @test */
    public function basic_plan_user_can_add_up_to_three_users_per_company()
    {
        // Assign basic plan
        $basicPlan = SubscriptionPlan::where('code', 'basic')->first();
        $this->createSubscription($this->user, $basicPlan);

        $this->actingAs($this->user);
        TenantContext::setTenant($this->tenant);

        $staffRole = Role::create(['name' => 'Staff', 'slug' => 'staff']);

        // Add second user
        $response = $this->post(route('master.users.store'), [
            'name' => 'User Two',
            'email' => 'user2@example.com',
            'role_id' => $staffRole->id,
        ]);
        $response->assertRedirect(route('master.users.index'));

        // Add third user
        $response = $this->post(route('master.users.store'), [
            'name' => 'User Three',
            'email' => 'user3@example.com',
            'role_id' => $staffRole->id,
        ]);
        $response->assertRedirect(route('master.users.index'));

        // Verify 3 users now
        $this->assertEquals(3, $this->tenant->users()->count());

        // Try to add fourth user (should fail)
        $response = $this->post(route('master.users.store'), [
            'name' => 'User Four',
            'email' => 'user4@example.com',
            'role_id' => $staffRole->id,
        ]);

        $response->assertSessionHasErrors('error');
        $this->assertStringContainsString('maximum number of users (3)', session('errors')->first('error'));

        // Verify still only 3 users
        $this->assertEquals(3, $this->tenant->users()->count());
    }

    /** @test */
    public function free_plan_user_cannot_create_more_than_ten_invoices_per_month()
    {
        // Assign free plan
        $freePlan = SubscriptionPlan::where('code', 'free')->first();
        $this->createSubscription($this->user, $freePlan);

        $this->actingAs($this->user);
        TenantContext::setTenant($this->tenant);

        // Create a customer
        $customer = \App\Models\Customer::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Test Customer',
            'code' => 'CUST-001',
            'is_active' => true,
        ]);

        // Create 10 invoices this month
        for ($i = 1; $i <= 10; $i++) {
            Invoice::create([
                'tenant_id' => $this->tenant->id,
                'customer_id' => $customer->id,
                'number' => 'INV-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'date' => now(),
                'due_date' => now()->addDays(30),
                'subtotal' => 100,
                'tax_amount' => 0,
                'total' => 100,
                'outstanding_amount' => 100,
                'status' => 'draft',
            ]);
        }

        // Try to create 11th invoice (should fail)
        $response = $this->post(route('sales.invoices.store'), [
            'customer_id' => $customer->id,
            'date' => now()->format('Y-m-d'),
            'due_date' => now()->addDays(30)->format('Y-m-d'),
            'items' => [
                [
                    'description' => 'Test Item',
                    'quantity' => 1,
                    'unit_price' => 100,
                    'tax_percent' => 0,
                ],
            ],
        ]);

        $response->assertSessionHasErrors('error');
        $this->assertStringContainsString('maximum number of invoices (10)', session('errors')->first('error'));

        // Verify still only 10 invoices
        $this->assertEquals(10, Invoice::where('tenant_id', $this->tenant->id)
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count());
    }

    /** @test */
    public function basic_plan_user_can_create_up_to_one_hundred_invoices_per_month()
    {
        // Assign basic plan
        $basicPlan = SubscriptionPlan::where('code', 'basic')->first();
        $this->createSubscription($this->user, $basicPlan);

        $this->actingAs($this->user);
        TenantContext::setTenant($this->tenant);

        // Create a customer
        $customer = \App\Models\Customer::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Test Customer',
            'code' => 'CUST-001',
            'is_active' => true,
        ]);

        // Create 100 invoices this month
        for ($i = 1; $i <= 100; $i++) {
            Invoice::create([
                'tenant_id' => $this->tenant->id,
                'customer_id' => $customer->id,
                'number' => 'INV-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'date' => now(),
                'due_date' => now()->addDays(30),
                'subtotal' => 100,
                'tax_amount' => 0,
                'total' => 100,
                'outstanding_amount' => 100,
                'status' => 'draft',
            ]);
        }

        // Try to create 101st invoice (should fail)
        $response = $this->post(route('sales.invoices.store'), [
            'customer_id' => $customer->id,
            'date' => now()->format('Y-m-d'),
            'due_date' => now()->addDays(30)->format('Y-m-d'),
            'items' => [
                [
                    'description' => 'Test Item',
                    'quantity' => 1,
                    'unit_price' => 100,
                    'tax_percent' => 0,
                ],
            ],
        ]);

        $response->assertSessionHasErrors('error');
        $this->assertStringContainsString('maximum number of invoices (100)', session('errors')->first('error'));

        // Verify still only 100 invoices
        $this->assertEquals(100, Invoice::where('tenant_id', $this->tenant->id)
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count());
    }

    /** @test */
    public function enterprise_plan_allows_unlimited_invoices()
    {
        // Assign enterprise plan
        $enterprisePlan = SubscriptionPlan::where('code', 'enterprise')->first();
        $this->createSubscription($this->user, $enterprisePlan);

        $this->actingAs($this->user);
        TenantContext::setTenant($this->tenant);

        // Create a customer
        $customer = \App\Models\Customer::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Test Customer',
            'code' => 'CUST-001',
            'is_active' => true,
        ]);

        // Create many invoices
        for ($i = 1; $i <= 150; $i++) {
            Invoice::create([
                'tenant_id' => $this->tenant->id,
                'customer_id' => $customer->id,
                'number' => 'INV-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'date' => now(),
                'due_date' => now()->addDays(30),
                'subtotal' => 100,
                'tax_amount' => 0,
                'total' => 100,
                'outstanding_amount' => 100,
                'status' => 'draft',
            ]);
        }

        // Should be able to create more (unlimited)
        $response = $this->post(route('sales.invoices.store'), [
            'customer_id' => $customer->id,
            'date' => now()->format('Y-m-d'),
            'due_date' => now()->addDays(30)->format('Y-m-d'),
            'items' => [
                [
                    'description' => 'Test Item',
                    'quantity' => 1,
                    'unit_price' => 100,
                    'tax_percent' => 0,
                ],
            ],
        ]);

        $response->assertRedirect(route('sales.invoices.index'));
    }

    /** @test */
    public function invoice_limit_resets_each_month()
    {
        // Assign free plan (10 invoices/month)
        $freePlan = SubscriptionPlan::where('code', 'free')->first();
        $this->createSubscription($this->user, $freePlan);

        $this->actingAs($this->user);
        TenantContext::setTenant($this->tenant);

        // Create a customer
        $customer = \App\Models\Customer::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Test Customer',
            'code' => 'CUST-001',
            'is_active' => true,
        ]);

        // Create 10 invoices last month
        for ($i = 1; $i <= 10; $i++) {
            Invoice::create([
                'tenant_id' => $this->tenant->id,
                'customer_id' => $customer->id,
                'number' => 'INV-LAST-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'date' => now()->subMonth(),
                'due_date' => now()->subMonth()->addDays(30),
                'subtotal' => 100,
                'tax_amount' => 0,
                'total' => 100,
                'outstanding_amount' => 100,
                'status' => 'draft',
                'created_at' => now()->subMonth(),
            ]);
        }

        // Should be able to create invoice this month
        $response = $this->post(route('sales.invoices.store'), [
            'customer_id' => $customer->id,
            'date' => now()->format('Y-m-d'),
            'due_date' => now()->addDays(30)->format('Y-m-d'),
            'items' => [
                [
                    'description' => 'Test Item',
                    'quantity' => 1,
                    'unit_price' => 100,
                    'tax_percent' => 0,
                ],
            ],
        ]);

        $response->assertRedirect(route('sales.invoices.index'));
    }

    /** @test */
    public function user_without_subscription_cannot_create_resources()
    {
        // User has no subscription
        $this->actingAs($this->user);
        TenantContext::setTenant($this->tenant);

        // Try to create company
        $response = $this->post(route('companies.store'), [
            'name' => 'New Company',
            'email' => 'new@example.com',
        ]);
        $response->assertSessionHasErrors('error');
        $this->assertStringContainsString('No active subscription', session('errors')->first('error'));

        // Try to add user
        $staffRole = Role::create(['name' => 'Staff', 'slug' => 'staff']);
        $response = $this->post(route('master.users.store'), [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'role_id' => $staffRole->id,
        ]);
        $response->assertSessionHasErrors('error');
        $this->assertStringContainsString('No active subscription', session('errors')->first('error'));
    }

    private function createSubscription(User $user, SubscriptionPlan $plan): UserSubscription
    {
        return UserSubscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'billing_cycle' => 'monthly',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ]);
    }
}
