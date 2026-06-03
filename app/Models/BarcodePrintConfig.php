<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BarcodePrintConfig extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'qty'               => 'integer',
        'width_cm'          => 'float',
        'height_cm'         => 'float',
        'gap_x_mm'          => 'float',
        'gap_y_mm'          => 'float',
        'margin_top_mm'     => 'float',
        'margin_right_mm'   => 'float',
        'margin_bottom_mm'  => 'float',
        'margin_left_mm'    => 'float',
    ];
}
