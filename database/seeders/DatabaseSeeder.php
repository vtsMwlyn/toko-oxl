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

    public function run(): void
    {
        // ── Users ─────────────────────────────────────────────────────────────

        User::factory()->create([
            'name'     => 'Ryan Marchellous',
            'email'    => 'admin@tokooxl.com',
            'password' => Hash::make('password'),
            'role'     => 'Admin',
        ]);

        User::factory()->create([
            'name'     => 'Cashier 1',
            'email'    => 'cashier1@tokooxl.com',
            'password' => Hash::make('password'),
            'role'     => 'User',
        ]);

        User::factory()->create([
            'name'     => 'Cashier 2',
            'email'    => 'cashier2@tokooxl.com',
            'password' => Hash::make('password'),
            'role'     => 'User',
        ]);

        // ── Products ──────────────────────────────────────────────────────────

        $alsibgswmx = Product::create([
            'name'           => 'Sarung Al Samsi',
            'variant'        => 'Bangsawan Mix',
            'code'           => 'ALSIBGSWMX',
            'barcode'        => BarcodeHelper::generate(),
            'stock'          => 100,
            'normal_price'   => 72500,
            'customer_price' => 62500,
        ]);

        Discount::create(['product_id' => $alsibgswmx->id, 'min_qty' => 10,  'normal_price' => 65000, 'customer_price' => 62500]);
        Discount::create(['product_id' => $alsibgswmx->id, 'min_qty' => 20,  'normal_price' => 64000, 'customer_price' => 61000]);
        Discount::create(['product_id' => $alsibgswmx->id, 'min_qty' => 100, 'normal_price' => 60000, 'customer_price' => 59000]);

        $atshtm790 = Product::create([
            'name'           => 'Sarung Atlas',
            'variant'        => 'Hitam 790',
            'code'           => 'ATSHTM790',
            'barcode'        => BarcodeHelper::generate(),
            'stock'          => 70,
            'normal_price'   => 58000,
            'customer_price' => 48000,
        ]);

        Discount::create(['product_id' => $atshtm790->id, 'min_qty' => 10, 'normal_price' => 52000, 'customer_price' => 45000]);
        Discount::create(['product_id' => $atshtm790->id, 'min_qty' => 30, 'normal_price' => 48000, 'customer_price' => 43000]);

        $wdmjqahtm = Product::create([
            'name'           => 'Sarung Wadimor',
            'variant'        => 'JQ Antik Hitam',
            'code'           => 'WDMJQAHTM',
            'barcode'        => BarcodeHelper::generate(),
            'stock'          => 130,
            'normal_price'   => 67500,
            'customer_price' => 57500,
        ]);

        Discount::create(['product_id' => $wdmjqahtm->id, 'min_qty' => 20, 'normal_price' => 62000, 'customer_price' => 54000]);
        Discount::create(['product_id' => $wdmjqahtm->id, 'min_qty' => 50, 'normal_price' => 58000, 'customer_price' => 51000]);

        $pcigaraputih = Product::create([
            'name'           => 'Peci Garasi',
            'variant'        => 'Putih Polos',
            'code'           => 'PCGRPUTIH',
            'barcode'        => BarcodeHelper::generate(),
            'stock'          => 200,
            'normal_price'   => 25000,
            'customer_price' => 20000,
        ]);

        Discount::create(['product_id' => $pcigaraputih->id, 'min_qty' => 12, 'normal_price' => 22000, 'customer_price' => 18500]);
        Discount::create(['product_id' => $pcigaraputih->id, 'min_qty' => 48, 'normal_price' => 20000, 'customer_price' => 17000]);

        $tasbihkayu99 = Product::create([
            'name'           => 'Tasbih Kayu',
            'variant'        => '99 Biji Cokelat',
            'code'           => 'TSBHKYU99',
            'barcode'        => BarcodeHelper::generate(),
            'stock'          => 85,
            'normal_price'   => 35000,
            'customer_price' => 28000,
        ]);

        Discount::create(['product_id' => $tasbihkayu99->id, 'min_qty' => 10, 'normal_price' => 30000, 'customer_price' => 25000]);

        // ── Customers ─────────────────────────────────────────────────────────

        $asep = Customer::create([
            'name'    => 'Asep',
            'phone'   => '08123456789',
            'address' => 'Taman Kopo Indah III Blok E11/A no 8',
            'notes'   => null,
        ]);

        $budi = Customer::create([
            'name'    => 'Budi',
            'phone'   => '08987654321',
            'address' => 'Jalan Moch Yunus No 23',
            'notes'   => null,
        ]);

        $dewi = Customer::create([
            'name'    => 'Dewi Santika',
            'phone'   => '08561234567',
            'address' => 'Perumahan Griya Bandung Permai No 14',
            'notes'   => 'Pelanggan grosir, biasanya order bulanan',
        ]);

        $hendra = Customer::create([
            'name'    => 'Hendra Gunawan',
            'phone'   => '08221234567',
            'address' => 'Jalan Soekarno Hatta No 88',
            'notes'   => null,
        ]);

        // ── Sales ─────────────────────────────────────────────────────────────

        // Sale 1 — Asep, 25 Apr
        $s1 = Sale::create(['date' => '2026-04-25', 'time' => '12:54:03', 'customer_name' => $asep->name, 'status' => 'Fixed']);
        SaleItem::create(['sale_id' => $s1->id, 'product_id' => $alsibgswmx->id, 'price' => $alsibgswmx->customer_price, 'qty' => 4,  'discount' => 0, 'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s1->id, 'product_id' => $atshtm790->id,  'price' => $atshtm790->customer_price,  'qty' => 2,  'discount' => 0, 'type' => 'Sell']);

        // Sale 2 — Asep, 26 Apr (bulk, triggers discount tier)
        $s2 = Sale::create(['date' => '2026-04-26', 'time' => '09:08:56', 'customer_name' => $asep->name, 'status' => 'Fixed']);
        SaleItem::create(['sale_id' => $s2->id, 'product_id' => $alsibgswmx->id, 'price' => 62500, 'qty' => 10, 'discount' => 0, 'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s2->id, 'product_id' => $atshtm790->id,  'price' => $atshtm790->customer_price, 'qty' => 2, 'discount' => 0, 'type' => 'Sell']);

        // Sale 3 — Budi, 24 Apr (large order)
        $s3 = Sale::create(['date' => '2026-04-24', 'time' => '10:57:00', 'customer_name' => $budi->name, 'status' => 'Fixed']);
        SaleItem::create(['sale_id' => $s3->id, 'product_id' => $atshtm790->id,  'price' => 40000, 'qty' => 30, 'discount' => 0, 'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s3->id, 'product_id' => $wdmjqahtm->id,  'price' => 50000, 'qty' => 50, 'discount' => 0, 'type' => 'Sell']);

        // Sale 4 — Cindy (walk-in, not registered)
        $s4 = Sale::create(['date' => '2026-04-25', 'time' => '17:05:11', 'customer_name' => 'Cindy', 'status' => 'Fixed']);
        SaleItem::create(['sale_id' => $s4->id, 'product_id' => $wdmjqahtm->id, 'price' => $wdmjqahtm->normal_price, 'qty' => 5, 'discount' => 0, 'type' => 'Sell']);

        // Sale 5 — Dewi, bulk peci
        $s5 = Sale::create(['date' => '2026-04-23', 'time' => '14:22:30', 'customer_name' => $dewi->name, 'status' => 'Fixed']);
        SaleItem::create(['sale_id' => $s5->id, 'product_id' => $pcigaraputih->id, 'price' => 18500, 'qty' => 48, 'discount' => 0,    'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s5->id, 'product_id' => $tasbihkayu99->id, 'price' => 25000, 'qty' => 10, 'discount' => 0,    'type' => 'Sell']);

        // Sale 6 — Hendra
        $s6 = Sale::create(['date' => '2026-04-22', 'time' => '11:10:00', 'customer_name' => $hendra->name, 'status' => 'Fixed']);
        SaleItem::create(['sale_id' => $s6->id, 'product_id' => $alsibgswmx->id,   'price' => $alsibgswmx->normal_price,   'qty' => 3, 'discount' => 0,    'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s6->id, 'product_id' => $pcigaraputih->id, 'price' => $pcigaraputih->normal_price, 'qty' => 6, 'discount' => 2000, 'type' => 'Sell']);

        // Sale 7 — Budi, with return
        $s7 = Sale::create(['date' => '2026-04-26', 'time' => '15:30:00', 'customer_name' => $budi->name, 'status' => 'Fixed']);
        SaleItem::create(['sale_id' => $s7->id, 'product_id' => $wdmjqahtm->id, 'price' => 54000, 'qty' => 20, 'discount' => 0, 'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s7->id, 'product_id' => $wdmjqahtm->id, 'price' => 54000, 'qty' => 2,  'discount' => 0, 'type' => 'Return']);

        // Sale 8 — Dewi, tasbih grosir
        $s8 = Sale::create(['date' => '2026-04-21', 'time' => '08:45:00', 'customer_name' => $dewi->name, 'status' => 'Fixed']);
        SaleItem::create(['sale_id' => $s8->id, 'product_id' => $tasbihkayu99->id, 'price' => 25000, 'qty' => 20, 'discount' => 0, 'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s8->id, 'product_id' => $alsibgswmx->id,   'price' => 62500, 'qty' => 15, 'discount' => 0, 'type' => 'Sell']);

        // Sale 9 — walk-in (no customer name), draft
        $s9 = Sale::create(['date' => '2026-04-26', 'time' => '16:48:22', 'customer_name' => null, 'status' => 'Draft']);
        SaleItem::create(['sale_id' => $s9->id, 'product_id' => $atshtm790->id,    'price' => $atshtm790->normal_price,    'qty' => 1, 'discount' => 0, 'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s9->id, 'product_id' => $pcigaraputih->id, 'price' => $pcigaraputih->normal_price, 'qty' => 2, 'discount' => 0, 'type' => 'Sell']);

        // Sale 10 — Hendra, mixed items with discount
        $s10 = Sale::create(['date' => '2026-04-20', 'time' => '13:00:00', 'customer_name' => $hendra->name, 'status' => 'Fixed']);
        SaleItem::create(['sale_id' => $s10->id, 'product_id' => $wdmjqahtm->id,   'price' => $wdmjqahtm->normal_price,   'qty' => 4,  'discount' => 5000, 'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s10->id, 'product_id' => $tasbihkayu99->id, 'price' => $tasbihkayu99->normal_price,'qty' => 5,  'discount' => 0,    'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s10->id, 'product_id' => $pcigaraputih->id, 'price' => $pcigaraputih->normal_price,'qty' => 12, 'discount' => 0,    'type' => 'Sell']);
    }
}
