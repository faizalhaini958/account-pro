<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Traits\TenantScoped;

class Setting extends Model
{
    use TenantScoped;

    protected $guarded = ['id'];
}
