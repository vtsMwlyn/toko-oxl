<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $guarded = ['id'];

    public function sales()
    {
        return Sale::where('customer_name', $this->name);
    }
}
