<?php

namespace App\Services\Posting;

use App\Models\ChartOfAccount;
use App\Services\TenantContext;

class GLAccountResolver
{
    /**
     * Get GL account code for a specific type
     * 
     * @param string $type (ar_account, ap_account, sales_account, etc.)
     * @param string|null $fallback
     * @return string|null
     */
    public function resolve(string $type, ?string $fallback = null): ?string
    {
        $tenant = TenantContext::getTenant();
        
        if (!$tenant) {
            return $fallback;
        }

        // Get from tenant settings
        $settings = $tenant->settings ?? [];
        $glSettings = $settings['gl'] ?? [];
        
        return $glSettings[$type] ?? $fallback;
    }

    /**
     * Get ChartOfAccount model by code
     * 
     * @param string $code
     * @return ChartOfAccount|null
     */
    public function getAccount(string $code): ?ChartOfAccount
    {
        return ChartOfAccount::where('code', $code)->first();
    }

    /**
     * Get account ID by type
     * 
     * @param string $type
     * @param string|null $fallback
     * @return int|null
     */
    public function getAccountId(string $type, ?string $fallback = null): ?int
    {
        $code = $this->resolve($type, $fallback);
        
        if (!$code) {
            return null;
        }

        $account = $this->getAccount($code);
        return $account?->id;
    }

    /**
     * Validate that all required GL accounts are configured
     * 
     * @param array $requiredTypes
     * @return array Array of missing account types
     */
    public function validateConfiguration(array $requiredTypes): array
    {
        $missing = [];
        
        foreach ($requiredTypes as $type) {
            if (!$this->resolve($type)) {
                $missing[] = $type;
            }
        }
        
        return $missing;
    }
}
