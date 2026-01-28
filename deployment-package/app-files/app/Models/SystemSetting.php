<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Cache;

class SystemSetting extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get a setting value by group and key
     */
    public static function getValue(string $group, string $key, mixed $default = null): mixed
    {
        $cacheKey = "system_setting:{$group}:{$key}";

        return Cache::remember($cacheKey, now()->addHours(1), function () use ($group, $key, $default) {
            $setting = static::where('group', $group)->where('key', $key)->first();

            if (!$setting) {
                return $default;
            }

            return static::castValue($setting->value, $setting->type);
        });
    }

    /**
     * Set a setting value
     */
    public static function setValue(string $group, string $key, mixed $value, string $type = 'string', ?string $description = null): void
    {
        $storedValue = static::prepareValue($value, $type);

        static::updateOrCreate(
            ['group' => $group, 'key' => $key],
            [
                'value' => $storedValue,
                'type' => $type,
                'description' => $description,
            ]
        );

        Cache::forget("system_setting:{$group}:{$key}");
        Cache::forget("system_settings:{$group}");
    }

    /**
     * Get all settings for a group
     */
    public static function getGroup(string $group): array
    {
        $cacheKey = "system_settings:{$group}";

        return Cache::remember($cacheKey, now()->addHours(1), function () use ($group) {
            $settings = static::where('group', $group)->get();
            $result = [];

            foreach ($settings as $setting) {
                $result[$setting->key] = static::castValue($setting->value, $setting->type);
            }

            return $result;
        });
    }

    /**
     * Set multiple settings for a group
     */
    public static function setGroup(string $group, array $values, array $types = []): void
    {
        foreach ($values as $key => $value) {
            $type = $types[$key] ?? 'string';
            static::setValue($group, $key, $value, $type);
        }
    }

    /**
     * Clear cache for a group
     */
    public static function clearGroupCache(string $group): void
    {
        $settings = static::where('group', $group)->get();

        foreach ($settings as $setting) {
            Cache::forget("system_setting:{$group}:{$setting->key}");
        }
        Cache::forget("system_settings:{$group}");
    }

    /**
     * Cast value based on type
     */
    protected static function castValue(?string $value, string $type): mixed
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'integer' => (int) $value,
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($value, true),
            'encrypted' => Crypt::decryptString($value),
            default => $value,
        };
    }

    /**
     * Prepare value for storage based on type
     */
    protected static function prepareValue(mixed $value, string $type): ?string
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'json' => json_encode($value),
            'encrypted' => Crypt::encryptString((string) $value),
            'boolean' => $value ? '1' : '0',
            default => (string) $value,
        };
    }
}
