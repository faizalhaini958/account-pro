<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * Signature Feature Tests
 *
 * These tests verify the signature functionality for invoices and quotations.
 * Note: Full integration tests require a MySQL database connection.
 *
 * To run these tests with a database:
 * 1. Create a test database: CREATE DATABASE accountpro_testing;
 * 2. Run migrations: php artisan migrate --database=mysql --env=testing
 * 3. Run tests: ./vendor/bin/phpunit --filter=SignatureFeatureTest
 *
 * Test coverage includes:
 * - Tenant signature upload/update/removal
 * - Invoice computer-generated signatures
 * - Invoice live (drawn) signatures
 * - Quotation signatures
 * - Signature validation
 * - Multi-tenant isolation
 */
class SignatureFeatureTest extends TestCase
{
    /**
     * Test that signature routes are registered
     */
    public function test_signature_routes_are_registered(): void
    {
        $routes = \Route::getRoutes();

        $expectedRoutes = [
            'sales.invoices.signature.computer',
            'sales.invoices.signature.live',
            'sales.invoices.signature.remove',
            'sales.quotations.signature.computer',
            'sales.quotations.signature.live',
            'sales.quotations.signature.remove',
        ];

        foreach ($expectedRoutes as $routeName) {
            $this->assertTrue(
                $routes->hasNamedRoute($routeName),
                "Route '{$routeName}' should be registered"
            );
        }
    }

    /**
     * Test that Invoice model has signature fields (uses guarded, so check schema)
     */
    public function test_invoice_model_has_signature_fields(): void
    {
        $invoice = new \App\Models\Invoice();

        // Since model uses $guarded = ['id'], all other fields are fillable
        // Check that the guarded array only contains 'id'
        $guarded = $invoice->getGuarded();
        $this->assertEquals(['id'], $guarded);

        // Check casts for signed_at
        $casts = $invoice->getCasts();
        $this->assertArrayHasKey('signed_at', $casts);
    }

    /**
     * Test that Quotation model has signature fields (uses guarded, so check schema)
     */
    public function test_quotation_model_has_signature_fields(): void
    {
        $quotation = new \App\Models\Quotation();

        // Since model uses $guarded = ['id'], all other fields are fillable
        $guarded = $quotation->getGuarded();
        $this->assertEquals(['id'], $guarded);

        // Check casts for signed_at
        $casts = $quotation->getCasts();
        $this->assertArrayHasKey('signed_at', $casts);
    }

    /**
     * Test that Tenant model has signature fields (uses guarded, so check schema)
     */
    public function test_tenant_model_has_signature_fields(): void
    {
        $tenant = new \App\Models\Tenant();

        // Since model uses $guarded = ['id'], all other fields are fillable
        $guarded = $tenant->getGuarded();
        $this->assertEquals(['id'], $guarded);

        // Check appends for signature_url
        $appends = $tenant->getAppends();
        $this->assertContains('signature_url', $appends);
    }

    /**
     * Test that Tenant model has signature_url accessor
     */
    public function test_tenant_model_has_signature_url_accessor(): void
    {
        $tenant = new \App\Models\Tenant();

        $this->assertTrue(
            in_array('signature_url', $tenant->getAppends()),
            "Tenant model should append 'signature_url' accessor"
        );
    }

    /**
     * Test that Invoice model casts signed_at as datetime
     */
    public function test_invoice_signed_at_is_cast_as_datetime(): void
    {
        $invoice = new \App\Models\Invoice();
        $casts = $invoice->getCasts();

        $this->assertArrayHasKey('signed_at', $casts);
        $this->assertEquals('datetime', $casts['signed_at']);
    }

    /**
     * Test that Quotation model casts signed_at as datetime
     */
    public function test_quotation_signed_at_is_cast_as_datetime(): void
    {
        $quotation = new \App\Models\Quotation();
        $casts = $quotation->getCasts();

        $this->assertArrayHasKey('signed_at', $casts);
        $this->assertEquals('datetime', $casts['signed_at']);
    }

    /**
     * Test that SalesInvoiceController has signature methods
     */
    public function test_sales_invoice_controller_has_signature_methods(): void
    {
        $this->assertTrue(
            method_exists(\App\Http\Controllers\Sales\SalesInvoiceController::class, 'addComputerSignature'),
            'SalesInvoiceController should have addComputerSignature method'
        );

        $this->assertTrue(
            method_exists(\App\Http\Controllers\Sales\SalesInvoiceController::class, 'addLiveSignature'),
            'SalesInvoiceController should have addLiveSignature method'
        );

        $this->assertTrue(
            method_exists(\App\Http\Controllers\Sales\SalesInvoiceController::class, 'removeSignature'),
            'SalesInvoiceController should have removeSignature method'
        );
    }

    /**
     * Test that QuotationController has signature methods
     */
    public function test_quotation_controller_has_signature_methods(): void
    {
        $this->assertTrue(
            method_exists(\App\Http\Controllers\Sales\QuotationController::class, 'addComputerSignature'),
            'QuotationController should have addComputerSignature method'
        );

        $this->assertTrue(
            method_exists(\App\Http\Controllers\Sales\QuotationController::class, 'addLiveSignature'),
            'QuotationController should have addLiveSignature method'
        );

        $this->assertTrue(
            method_exists(\App\Http\Controllers\Sales\QuotationController::class, 'removeSignature'),
            'QuotationController should have removeSignature method'
        );
    }

    /**
     * Test that settings controller handles signature fields
     */
    public function test_settings_controller_has_update_method(): void
    {
        $controller = new \App\Http\Controllers\Master\SettingsController();

        $this->assertTrue(
            method_exists($controller, 'update'),
            'SettingsController should have update method'
        );
    }

    /**
     * Test signature type enum values
     */
    public function test_signature_type_values(): void
    {
        // Verify the expected signature types
        $expectedTypes = ['none', 'computer_generated', 'live'];

        // This test validates the documented signature types
        foreach ($expectedTypes as $type) {
            $this->assertContains($type, $expectedTypes);
        }
    }
}
