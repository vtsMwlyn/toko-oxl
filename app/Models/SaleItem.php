<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    protected $guarded = ['id'];

    public function sale(){
        return $this->belongsTo(Sale::class);
    }

    public function variant(){
        return $this->belongsTo(Variant::class);
    }
}
