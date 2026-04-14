<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $guarded = ['id'];

    public function sale(){
        return $this->belongsTo(Sale::class);
    }

    public function product(){
        return $this->belongsTo(Product::class);
    }

    public function items(){
        return $this->hasMany(SaleItem::class);
    }
}
