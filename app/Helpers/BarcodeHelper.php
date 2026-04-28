<?php

namespace App\Helpers;

use App\Models\Variant;

class BarcodeHelper
{
    /**
     * Generate unique EAN-13 barcode
     */
    public static function generate(): string
    {
        do {
            $base = self::generateBase();
            $checksum = self::calculateChecksum($base);

            $barcode = $base . $checksum;

        } while (Variant::where('barcode', $barcode)->exists());

        return $barcode;
    }

    /**
     * Generate 12-digit base (EAN-13 without checksum)
     */
    private static function generateBase(): string
    {
        // Option A: Pure random
        // return str_pad(random_int(0, 999999999999), 12, '0', STR_PAD_LEFT);

        // Option B (recommended): Indonesia prefix (uncomment if needed)
        return '899' . str_pad(random_int(0, 999999999), 9, '0', STR_PAD_LEFT);
    }

    /**
     * Calculate EAN-13 checksum digit
     */
    private static function calculateChecksum(string $digits): int
    {
        $sum = 0;

        for ($i = 0; $i < 12; $i++) {
            $digit = (int) $digits[$i];

            // Even index → weight 1
            // Odd index  → weight 3
            $sum += ($i % 2 === 0) ? $digit : $digit * 3;
        }

        $remainder = $sum % 10;

        return $remainder === 0 ? 0 : 10 - $remainder;
    }
}
