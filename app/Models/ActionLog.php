<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActionLog extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'changes' => 'array',
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }

    protected function serializeDate(\DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }
}
