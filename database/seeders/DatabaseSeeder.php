<?php

namespace Database\Seeders;

use App\Helpers\BarcodeHelper;
use App\Models\Discount;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Ryan Marchellous',
            'email' => 'admin@tokooxl.com',
            'password' => Hash::make('password'),
            'role' => 'Admin',
        ]);

        $sarung_alsamsi_bangsawan_mix = Product::create([
            'name' => 'Sarung Al Samsi',
            'variant' => 'Bangsawan Mix',
            'code' => 'ALSIBGSWMX',
            'barcode' => BarcodeHelper::generate(),
            'stock' => 100,
            'normal_price' => 72500,
            'customer_price' => 62500,
        ]);

        Discount::create([
            'product_id' => $sarung_alsamsi_bangsawan_mix->id,
            'normal_price' => 65000,
            'customer_price' => 62500,
            'min_qty' => 10,
        ]);

        Discount::create([
            'product_id' => $sarung_alsamsi_bangsawan_mix->id,
            'normal_price' => 64000,
            'customer_price' => 61000,
            'min_qty' => 20,
        ]);

        Discount::create([
            'product_id' => $sarung_alsamsi_bangsawan_mix->id,
            'normal_price' => 60000,
            'customer_price' => 59000,
            'min_qty' => 100,
        ]);

        Product::create([
            'name' => 'Sarung Atlas',
            'variant' => 'Hitam 790',
            'code' => 'ATSHTM790',
            'barcode' => BarcodeHelper::generate(),
            'stock' => 70,
            'normal_price' => 58000,
            'customer_price' => 48000,
        ]);

        Product::create([
            'name' => 'Sarung Wadimor',
            'variant' => 'JQ Antik Hitam',
            'code' => 'WDMJQAHTM',
            'barcode' => BarcodeHelper::generate(),
            'stock' => 130,
            'normal_price' => 67500,
            'customer_price' => 57500,
        ]);
    }
}
