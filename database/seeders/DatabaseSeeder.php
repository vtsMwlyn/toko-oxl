<?php

namespace Database\Seeders;

use App\Helpers\BarcodeHelper;
use App\Models\Customer;
use App\Models\Discount;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
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
        // Generate Admin and Cashiers
        User::factory()->create([
            'name' => 'Ryan Marchellous',
            'email' => 'admin@tokooxl.com',
            'password' => Hash::make('password'),
            'role' => 'Admin',
        ]);

        User::factory()->create([
            'name' => 'Cashier 1',
            'email' => 'cashier1@tokooxl.com',
            'password' => Hash::make('password'),
            'role' => 'User',
        ]);

        User::factory()->create([
            'name' => 'Cashier 2',
            'email' => 'cashier2@tokooxl.com',
            'password' => Hash::make('password'),
            'role' => 'User',
        ]);

        // Generate Products and Special Prices
        $sarung_alsamsi_bangsawan_mix = Product::create([
            'name' => 'Sarung Al Samsi',
            'variant' => 'Bangsawan Mix',
            'code' => 'ALSIBGSWMX',
            'barcode' => '8999085051248',
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

        $sarung_atlas_hitam_790 = Product::create([
            'name' => 'Sarung Atlas',
            'variant' => 'Hitam 790',
            'code' => 'ATSHTM790',
            'barcode' => '8998763385569',
            'stock' => 70,
            'normal_price' => 58000,
            'customer_price' => 48000,
        ]);

        $sarung_wadimor_jq_antik_hitam = Product::create([
            'name' => 'Sarung Wadimor',
            'variant' => 'JQ Antik Hitam',
            'code' => 'WDMJQAHTM',
            'barcode' => '8999963269970',
            'stock' => 130,
            'normal_price' => 67500,
            'customer_price' => 57500,
        ]);

        // Generate Customer
        $asep = Customer::create([
            'name' => 'Asep',
            'phone' => '08123456789',
            'address' => 'Taman Kopo Indah III Blok E11/A no 8',
            'notes' => null,
        ]);

        $budi = Customer::create([
            'name' => 'Budi',
            'phone' => '08987654321',
            'address' => 'Jalan Moch Yunus No 23',
            'notes' => null,
        ]);

        // Generate Transaction
        $asep_20260425_125403 = Sale::create([
            'date' => '2026-04-25',
            'time' => '12:54:03',
            'customer_name' => $asep->name,
            'status' => 'Fixed',
        ]);

        SaleItem::create([
            'sale_id' => $asep_20260425_125403->id,
            'product_id' => $sarung_alsamsi_bangsawan_mix->id,
            'price' => $sarung_alsamsi_bangsawan_mix->customer_price,
            'qty' => 4,
            'discount' => 0,
            'type' => 'Sell',
        ]);

        SaleItem::create([
            'sale_id' => $asep_20260425_125403->id,
            'product_id' => $sarung_atlas_hitam_790->id,
            'price' => $sarung_atlas_hitam_790->customer_price,
            'qty' => 2,
            'discount' => 0,
            'type' => 'Sell',
        ]);

        $asep_20260426_090856 = Sale::create([
            'date' => '2026-04-26',
            'time' => '09:08:56',
            'customer_name' => $asep->name,
            'status' => 'Fixed',
        ]);

        SaleItem::create([
            'sale_id' => $asep_20260426_090856->id,
            'product_id' => $sarung_alsamsi_bangsawan_mix->id,
            'price' => 62500,
            'qty' => 10,
            'discount' => 0,
            'type' => 'Sell',
        ]);

        SaleItem::create([
            'sale_id' => $asep_20260426_090856->id,
            'product_id' => $sarung_atlas_hitam_790->id,
            'price' => $sarung_atlas_hitam_790->customer_price,
            'qty' => 2,
            'discount' => 0,
            'type' => 'Sell',
        ]);

        $budi_20260424_105700 = Sale::create([
            'date' => '2026-04-24',
            'time' => '10:57:00',
            'customer_name' => $budi->name,
            'status' => 'Fixed',
        ]);

        SaleItem::create([
            'sale_id' => $budi_20260424_105700->id,
            'product_id' => $sarung_atlas_hitam_790->id,
            'price' => 40000,
            'qty' => 30,
            'discount' => 0,
            'type' => 'Sell',
        ]);

        SaleItem::create([
            'sale_id' => $budi_20260424_105700->id,
            'product_id' => $sarung_wadimor_jq_antik_hitam->id,
            'price' => 50000,
            'qty' => 50,
            'discount' => 0,
            'type' => 'Sell',
        ]);

        $cindy_20260425_170511 = Sale::create([
            'date' => '2026-04-25',
            'time' => '17:05:11',
            'customer_name' => 'Cindy',
            'status' => 'Fixed',
        ]);

        SaleItem::create([
            'sale_id' => $cindy_20260425_170511->id,
            'product_id' => $sarung_wadimor_jq_antik_hitam->id,
            'price' => $sarung_wadimor_jq_antik_hitam->normal_price,
            'qty' => 5,
            'discount' => 0,
            'type' => 'Sell',
        ]);
    }
}
