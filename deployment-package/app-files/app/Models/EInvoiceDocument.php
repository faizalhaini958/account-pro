<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\TenantScoped;
use App\Traits\TracksUser;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EInvoiceDocument extends Model
{
    use TenantScoped, TracksUser;

    protected $table = 'einvoice_documents';

    protected $guarded = ['id'];

    protected $casts = [
        'einvoice_data' => 'array',
        'submitted_at' => 'datetime',
        'validated_at' => 'datetime',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(EInvoiceLog::class);
    }
}
