<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $guarded = ['id'];

    public function discounts(){
        return $this->hasMany(Discount::class);
    }
}
