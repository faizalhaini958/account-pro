<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;

trait TracksUser
{
    protected static function bootTracksUser(): void
    {
        static::creating(function (Model $model) {
            if (auth()->check()) {
                $model->created_by = auth()->id();
                $model->updated_by = auth()->id();
            }
        });

        static::updating(function (Model $model) {
            if (auth()->check()) {
                $model->updated_by = auth()->id();
            }
        });
    }
}
