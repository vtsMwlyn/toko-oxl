<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $guarded = ['id'];

    public function variants(){
        return $this->hasMany(Variant::class);
    }

    public function discounts(){
        return $this->hasMany(Discount::class);
    }
}
