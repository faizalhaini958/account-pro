<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Tenant;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RBACTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $tenant;
    private $role;
    private $permission;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->create(['current_tenant_id' => $this->tenant->id]);
        
        $this->role = Role::create(['name' => 'Test Role', 'slug' => 'test_role']);
        $this->permission = Permission::create(['name' => 'View Reports', 'slug' => 'reports.view']);
        
        // Give permission to role
        $this->role->permissions()->attach($this->permission->id);
    }

    public function test_user_has_permission_when_role_assigned()
    {
        // Assign role to user for this tenant
        $this->user->tenants()->attach($this->tenant->id, ['role_id' => $this->role->id]);

        $this->assertTrue($this->user->hasPermission('reports.view'));
    }

    public function test_user_does_not_have_permission_if_not_assigned()
    {
        // Assign role to user for this tenant
        $this->user->tenants()->attach($this->tenant->id, ['role_id' => $this->role->id]);

        $this->assertFalse($this->user->hasPermission('settings.edit'));
    }

    public function test_user_does_not_have_permission_if_no_role()
    {
        // User attached but no role (if possible) or role_id null
        $this->user->tenants()->attach($this->tenant->id, ['role_id' => null]);

        $this->assertFalse($this->user->hasPermission('reports.view'));
    }

    public function test_permission_check_respects_current_tenant()
    {
        // Tenant A: User has role with permission
        $this->user->tenants()->attach($this->tenant->id, ['role_id' => $this->role->id]);
        $this->assertTrue($this->user->hasPermission('reports.view'));

        // Tenant B: User has NO role
        $tenantB = Tenant::factory()->create();
        $this->user->current_tenant_id = $tenantB->id;
        $this->user->save();
        $this->user->refresh(); // reload relations

        // User not attached to Tenant B yet
        $this->assertFalse($this->user->hasPermission('reports.view'));
        
        // Attach to Tenant B with different role (no permissions)
        $emptyRole = Role::create(['name' => 'Empty', 'slug' => 'empty']);
        $this->user->tenants()->attach($tenantB->id, ['role_id' => $emptyRole->id]);
        
        $this->assertFalse($this->user->hasPermission('reports.view'));
    }
}
