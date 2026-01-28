<?php

namespace App\Models;

use App\Traits\TenantScoped;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use TenantScoped;

    protected $fillable = [
        'tenant_id',
        'product_id',
        'type',
        'quantity',
        'unit_cost',
        'total_cost',
        'balance_quantity',
        'reference',
        'date',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'balance_quantity' => 'decimal:2',
        'date' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
