<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\TenantScoped;
use App\Traits\TracksUser;

class EInvoiceBatch extends Model
{
    use TenantScoped, TracksUser;

    protected $guarded = ['id'];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'total_amount' => 'decimal:2',
        'submitted_at' => 'datetime',
    ];
}
