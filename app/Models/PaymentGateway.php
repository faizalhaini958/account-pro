<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class PaymentGateway extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'is_active' => 'boolean',
        'is_sandbox' => 'boolean',
        'config' => 'array',
        'supported_currencies' => 'array',
        'min_amount' => 'decimal:2',
        'max_amount' => 'decimal:2',
    ];

    /**
     * Get all active payment gateways
     */
    public static function getActive()
    {
        return static::where('is_active', true)->get();
    }

    /**
     * Get gateway by code
     */
    public static function findByCode(string $code): ?self
    {
        return static::where('code', $code)->first();
    }

    /**
     * Get decrypted config value
     */
    public function getDecryptedConfig(string $key, mixed $default = null): mixed
    {
        $config = $this->config ?? [];
        $value = $config[$key] ?? null;

        if ($value === null) {
            return $default;
        }

        // Sensitive keys are encrypted
        $sensitiveKeys = ['secret_key', 'api_secret', 'private_key', 'password', 'webhook_secret'];

        if (in_array($key, $sensitiveKeys)) {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception $e) {
                return $value;
            }
        }

        return $value;
    }

    /**
     * Set config with encryption for sensitive values
     */
    public function setSecureConfig(array $config): void
    {
        $sensitiveKeys = ['secret_key', 'api_secret', 'private_key', 'password', 'webhook_secret'];

        foreach ($config as $key => $value) {
            if (in_array($key, $sensitiveKeys) && $value !== null && $value !== '') {
                $config[$key] = Crypt::encryptString($value);
            }
        }

        $this->config = $config;
    }

    /**
     * Check if gateway supports a currency
     */
    public function supportsCurrency(string $currency): bool
    {
        if (empty($this->supported_currencies)) {
            return true; // No restrictions
        }

        return in_array($currency, $this->supported_currencies);
    }

    /**
     * Check if amount is within limits
     */
    public function isAmountValid(float $amount): bool
    {
        if ($this->min_amount !== null && $amount < $this->min_amount) {
            return false;
        }

        if ($this->max_amount !== null && $amount > $this->max_amount) {
            return false;
        }

        return true;
    }

    /**
     * Scope for active gateways
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
