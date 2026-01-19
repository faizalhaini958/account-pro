<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\TenantScoped;

class DocumentNumbering extends Model
{
    use TenantScoped;

    protected $table = 'document_numbering';
    protected $guarded = ['id'];
}
