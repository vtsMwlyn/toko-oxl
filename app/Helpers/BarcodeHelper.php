<?php

namespace App\Helpers;

use App\Models\Product;

class BarcodeHelper
{
    public static function generate()
    {
        do {
            // Generate 12-digit number
            $barcode = str_pad(random_int(0, 999999999999), 12, '0', STR_PAD_LEFT);
        } while (Product::where('barcode', $barcode)->exists());

        return $barcode;
    }
}
