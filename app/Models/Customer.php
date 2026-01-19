<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\TenantScoped;
use App\Traits\TracksUser;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes, TenantScoped, TracksUser;

    protected $guarded = ['id'];

    protected $casts = [
        'einvoice_data' => 'array',
        'is_active' => 'boolean',
        'credit_limit' => 'integer',
        'credit_days' => 'integer',
    ];
    protected function tin(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn () => $this->einvoice_data['tin'] ?? null,
        );
    }

    protected function idNumber(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn () => $this->einvoice_data['id_number'] ?? null,
        );
    }

    protected function idType(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn () => $this->einvoice_data['id_type'] ?? null,
        );
    }

    protected function contactNumber(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn () => $this->phone,
        );
    }

    protected function addressLine1(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: function () {
                $lines = explode("\n", $this->address ?? '');
                return $lines[0] ?? '';
            },
        );
    }

    protected function addressLine2(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: function () {
                $lines = explode("\n", $this->address ?? '');
                return $lines[1] ?? '';
            },
        );
    }

    protected function addressLine3(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: function () {
                $lines = explode("\n", $this->address ?? '');
                return $lines[2] ?? '';
            },
        );
    }
}
