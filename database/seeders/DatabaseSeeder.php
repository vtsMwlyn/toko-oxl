<?php

namespace Database\Seeders;

use App\Helpers\BarcodeHelper;
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
            'name' => 'Admin',
            'email' => 'admin@tokooxl.com',
            'password' => Hash::make('password'),
            'role' => 'Admin',
        ]);

        Product::create([
            'name' => 'Sarung Al Samsi',
            'variant' => 'Bangsawan Mix',
            'barcode' => BarcodeHelper::generate(),
            'stock' => 100,
            'price' => 200000,
        ]);

        Product::create([
            'name' => 'Sarung Atlas',
            'variant' => 'Hitam 790',
            'barcode' => BarcodeHelper::generate(),
            'stock' => 70,
            'price' => 250000,
        ]);

        Product::create([
            'name' => 'Sarung Wadimor',
            'variant' => 'JQ Antik Hitam',
            'barcode' => BarcodeHelper::generate(),
            'stock' => 130,
            'price' => 350000,
        ]);
    }
}
