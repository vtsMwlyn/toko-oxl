<?php

namespace App\Http\Controllers;

use App\Models\BarcodePrintConfig;
use Illuminate\Http\Request;

class BarcodePrintConfigController extends Controller
{
    private static array $defaults = [
        'qty'              => 1,
        'width_cm'         => 4.00,
        'height_cm'        => 1.50,
        'gap_x_mm'         => 4.00,
        'gap_y_mm'         => 4.00,
        'margin_top_mm'    => 8.00,
        'margin_right_mm'  => 8.00,
        'margin_bottom_mm' => 8.00,
        'margin_left_mm'   => 8.00,
    ];

    public function show()
    {
        return response()->json(
            BarcodePrintConfig::first() ?? self::$defaults
        );
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'qty'              => 'required|integer|min:1',
            'width_cm'         => 'required|numeric|min:0.1',
            'height_cm'        => 'required|numeric|min:0.1',
            'gap_x_mm'         => 'required|numeric|min:0',
            'gap_y_mm'         => 'required|numeric|min:0',
            'margin_top_mm'    => 'required|numeric|min:0',
            'margin_right_mm'  => 'required|numeric|min:0',
            'margin_bottom_mm' => 'required|numeric|min:0',
            'margin_left_mm'   => 'required|numeric|min:0',
        ]);

        $config = BarcodePrintConfig::first() ?? new BarcodePrintConfig();
        $config->fill($validated)->save();

        return response()->json($config);
    }
}
