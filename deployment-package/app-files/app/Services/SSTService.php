<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Invoice;
use App\Models\PurchaseInvoice;
use App\Services\TenantContext;

class SSTService
{
    /**
     * Calculate SST for an invoice
     */
    public function calculateSST(float $subtotal, float $sstRate = null): array
    {
        $tenant = TenantContext::getTenant();
        
        // If SST is not enabled, return zero
        if (!$tenant || !$tenant->sst_enabled) {
            return [
                'sst_rate' => 0,
                'sst_amount' => 0,
                'total' => $subtotal,
            ];
        }
        
        // Use provided rate or tenant's default SST rate (typically 6% or 10% in Malaysia)
        $rate = $sstRate ?? $this->getDefaultSSTRate($tenant);
        
        $sstAmount = round($subtotal * ($rate / 100), 2);
        $total = $subtotal + $sstAmount;
        
        return [
            'sst_rate' => $rate,
            'sst_amount' => $sstAmount,
            'total' => $total,
        ];
    }
    
    /**
     * Get default SST rate for tenant
     */
    protected function getDefaultSSTRate(Tenant $tenant): float
    {
        // Check tenant settings for custom SST rate
        $settings = $tenant->einvoice_settings ?? [];
        
        // Default SST rates in Malaysia:
        // - 6% for most goods and services
        // - 10% for certain services (e.g., food & beverage)
        // - 0% for exempt items
        return $settings['default_sst_rate'] ?? 6.0;
    }
    
    /**
     * Get SST payable for a period
     */
    public function getSSTPayable(\Carbon\Carbon $startDate, \Carbon\Carbon $endDate): array
    {
        $tenant = TenantContext::getTenant();
        
        if (!$tenant || !$tenant->sst_enabled) {
            return [
                'output_tax' => 0,
                'input_tax' => 0,
                'net_payable' => 0,
            ];
        }
        
        // Output Tax (Sales)
        $outputTax = Invoice::whereBetween('date', [$startDate, $endDate])
            ->where('status', '!=', 'void')
            ->sum('tax_amount');
        
        // Input Tax (Purchases)
        $inputTax = PurchaseInvoice::whereBetween('date', [$startDate, $endDate])
            ->where('status', '!=', 'void')
            ->sum('tax_amount');
        
        $netPayable = $outputTax - $inputTax;
        
        return [
            'output_tax' => $outputTax,
            'input_tax' => $inputTax,
            'net_payable' => $netPayable,
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
        ];
    }
    
    /**
     * Check if item is SST exempt
     */
    public function isExempt(string $itemCategory = null): bool
    {
        // List of SST exempt categories in Malaysia
        $exemptCategories = [
            'basic_food',
            'agriculture',
            'healthcare',
            'education',
            'public_transport',
            'financial_services',
        ];
        
        return in_array($itemCategory, $exemptCategories);
    }
    
    /**
     * Get SST rate for specific item category
     */
    public function getRateForCategory(string $category): float
    {
        // SST rates by category in Malaysia
        $rates = [
            'goods' => 10.0,           // Most goods
            'services' => 6.0,         // Most services
            'food_beverage' => 6.0,    // F&B services
            'professional' => 6.0,     // Professional services
            'exempt' => 0.0,           // Exempt items
        ];
        
        return $rates[$category] ?? 6.0;
    }
    
    /**
     * Enable SST for tenant
     */
    public function enableSST(Tenant $tenant, string $registrationNumber): bool
    {
        return $tenant->update([
            'sst_enabled' => true,
            'sst_registration_number' => $registrationNumber,
        ]);
    }
    
    /**
     * Disable SST for tenant
     */
    public function disableSST(Tenant $tenant): bool
    {
        return $tenant->update([
            'sst_enabled' => false,
        ]);
    }
    
    /**
     * Get SST configuration
     */
    public function getConfiguration(): array
    {
        $tenant = TenantContext::getTenant();
        
        if (!$tenant) {
            return [
                'enabled' => false,
                'registration_number' => null,
                'default_rate' => 6.0,
            ];
        }
        
        return [
            'enabled' => $tenant->sst_enabled,
            'registration_number' => $tenant->sst_registration_number,
            'default_rate' => $this->getDefaultSSTRate($tenant),
        ];
    }
}
