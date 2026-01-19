<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Product; // Using Product as a testable tenant-scoped model
use App\Services\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MultiTenancyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Create a role for testing
        \App\Models\Role::create(['name' => 'Admin', 'slug' => 'admin']);
    }

    public function test_tenant_scope_isolation()
    {
        $role = \App\Models\Role::first();
        // Create two tenants
        $tenantA = Tenant::create(['name' => 'Tenant A', 'slug' => 'tenant-a']);
        $tenantB = Tenant::create(['name' => 'Tenant B', 'slug' => 'tenant-b']);

        // Create a user for Tenant A
        $userA = User::factory()->create();
        $tenantA->users()->attach($userA, ['role_id' => $role->id]);
        $userA->update(['current_tenant_id' => $tenantA->id]);

        // Create a product in Tenant A
        // We simulate the context or let the trait handle it via auth
        $this->actingAs($userA);
        
        // Ensure context is set
        TenantContext::setTenant($tenantA);

        $productA = Product::create([
            'name' => 'Product A',
            'sku' => 'SKU-A',
            'retail_price' => 100,
            'purchase_cost' => 50,
        ]);

        // Assert Product A has tenant_id of Tenant A
        $this->assertEquals($tenantA->id, $productA->tenant_id);

        // Switch to Tenant B
        $userA->tenants()->attach($tenantB, ['role_id' => $role->id]);
        $userA->update(['current_tenant_id' => $tenantB->id]);
        TenantContext::setTenant($tenantB);

        // Verify we CANNOT see Product A
        $this->assertNull(Product::find($productA->id));

        // Create Product B in Tenant B
        $productB = Product::create([
            'name' => 'Product B',
            'sku' => 'SKU-B',
            'retail_price' => 200,
            'purchase_cost' => 100,
        ]);

        $this->assertEquals($tenantB->id, $productB->tenant_id);

        // Switch back to Tenant A
        $userA->update(['current_tenant_id' => $tenantA->id]);
        TenantContext::setTenant($tenantA);

        // Verify we CAN see Product A but NOT Product B
        $this->assertNotNull(Product::find($productA->id));
        $this->assertNull(Product::find($productB->id));
    }

    public function test_middleware_automatically_sets_context()
    {
        $role = \App\Models\Role::first();
        $tenant = Tenant::create(['name' => 'Middleware Tenant', 'slug' => 'mw-tenant']);
        $user = User::factory()->create(['current_tenant_id' => $tenant->id]);
        $tenant->users()->attach($user, ['role_id' => $role->id]);

        $this->actingAs($user);

        // Make a request to a route that uses the middleware (e.g., dashboard)
        $response = $this->get('/dashboard');
        $response->assertStatus(200);

        // Verify context is set
        $this->assertEquals($tenant->id, TenantContext::getTenantId());
    }

    public function test_user_creation_in_tenant_user_controller()
    {
         $role = \App\Models\Role::first();
         $tenant = Tenant::create(['name' => 'User Mgmt Tenant', 'slug' => 'um-tenant']);
         $admin = User::factory()->create(['current_tenant_id' => $tenant->id]);
         $tenant->users()->attach($admin, ['role_id' => $role->id]);

         $this->actingAs($admin);
         TenantContext::setTenant($tenant);

         // Add a new user via controller
         $response = $this->post(route('master.users.store'), [
             'name' => 'New Staff',
             'email' => 'staff@example.com',
             'role_id' => $role->id,
         ]);

         $response->assertRedirect(route('master.users.index'));
         
         $newUser = User::where('email', 'staff@example.com')->first();
         $this->assertNotNull($newUser);
         $this->assertTrue($tenant->users()->where('user_id', $newUser->id)->exists());
         
         // Refresh to get the latest data from database
         $newUser->refresh();
         $this->assertEquals($tenant->id, $newUser->current_tenant_id);
    }
}
