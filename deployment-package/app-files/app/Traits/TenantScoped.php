<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait TenantScoped
{
    protected static function bootTenantScoped(): void
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (\App\Services\TenantContext::check()) {
                $builder->where(static::getQualifiedTenantColumn(), \App\Services\TenantContext::getTenantId());
            } elseif (auth()->check() && auth()->user()->current_tenant_id) {
                 // Fallback if middleware hasn't run or in other contexts
                 $builder->where(static::getQualifiedTenantColumn(), auth()->user()->current_tenant_id);
            }
        });

        static::creating(function (Model $model) {
            if (!$model->tenant_id) {
                if (\App\Services\TenantContext::check()) {
                    $model->tenant_id = \App\Services\TenantContext::getTenantId();
                } elseif (auth()->check() && auth()->user()->current_tenant_id) {
                    $model->tenant_id = auth()->user()->current_tenant_id;
                }
            }
        });
    }

    protected static function getQualifiedTenantColumn(): string
    {
        return (new static())->getTable() . '.tenant_id';
    }
}
