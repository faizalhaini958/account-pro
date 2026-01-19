<?php

namespace App\Models;

use App\Observers\TenantObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[ObservedBy([TenantObserver::class])]
class Tenant extends Model
{
    use SoftDeletes, \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'financial_year_start' => 'date',
        'is_sst_registered' => 'boolean',
        'sst_rate' => 'decimal:2',
        'einvoice_settings' => 'array',
        'settings' => 'array',
        'is_active' => 'boolean',
        'myinvois_sandbox_mode' => 'boolean',
        'einvoice_enabled' => 'boolean',
    ];

    protected $appends = ['logo_url']; // Automatically append to JSON serialization

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot('role_id', 'is_active');
    }



    protected function logoUrl(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn () => $this->logo_path ? asset('storage/' . $this->logo_path) : null,
        );
    }

    protected function address(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn () => implode("\n", array_filter([$this->address_1, $this->address_2])),
        );
    }

    protected function primaryColor(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn () => $this->settings['primary_color'] ?? '#475569',
        );
    }
}
