<?php

namespace Database\Seeders;

use App\Helpers\BarcodeHelper;
use App\Models\Customer;
use App\Models\Discount;
use App\Models\Product;
use App\Models\Variant;
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

        // ── Products & Variants ───────────────────────────────────────────────

        $alsibgsw = Product::create([
            'name'           => 'Sarung Al Samsi',
            'normal_price'   => 72500,
            'customer_price' => 62500,
        ]);
        $alsibgswmx = Variant::create([
            'product_id' => $alsibgsw->id,
            'code'       => 'ALSIBGSWMX',
            'name'    => 'Bangsawan Mix',
            'barcode'    => BarcodeHelper::generate(),
            'stock'      => 100,
        ]);

        Discount::create(['product_id' => $alsibgsw->id, 'min_qty' => 10,  'normal_price' => 65000, 'customer_price' => 62500]);
        Discount::create(['product_id' => $alsibgsw->id, 'min_qty' => 20,  'normal_price' => 64000, 'customer_price' => 61000]);
        Discount::create(['product_id' => $alsibgsw->id, 'min_qty' => 100, 'normal_price' => 60000, 'customer_price' => 59000]);

        $atshtm = Product::create([
            'name'           => 'Sarung Atlas',
            'normal_price'   => 58000,
            'customer_price' => 48000,
        ]);
        $atshtm790 = Variant::create([
            'product_id' => $atshtm->id,
            'code'       => 'ATSHTM790',
            'name'    => 'Hitam 790',
            'barcode'    => BarcodeHelper::generate(),
            'stock'      => 70,
        ]);

        Discount::create(['product_id' => $atshtm->id, 'min_qty' => 10, 'normal_price' => 52000, 'customer_price' => 45000]);
        Discount::create(['product_id' => $atshtm->id, 'min_qty' => 30, 'normal_price' => 48000, 'customer_price' => 43000]);

        $wdmjqa = Product::create([
            'name'           => 'Sarung Wadimor',
            'normal_price'   => 67500,
            'customer_price' => 57500,
        ]);
        $wdmjqahtm = Variant::create([
            'product_id' => $wdmjqa->id,
            'code'       => 'WDMJQAHTM',
            'name'    => 'JQ Antik Hitam',
            'barcode'    => BarcodeHelper::generate(),
            'stock'      => 130,
        ]);

        Discount::create(['product_id' => $wdmjqa->id, 'min_qty' => 20, 'normal_price' => 62000, 'customer_price' => 54000]);
        Discount::create(['product_id' => $wdmjqa->id, 'min_qty' => 50, 'normal_price' => 58000, 'customer_price' => 51000]);

        $pcigara = Product::create([
            'name'           => 'Peci Garasi',
            'normal_price'   => 25000,
            'customer_price' => 20000,
        ]);
        $pcigaraputih = Variant::create([
            'product_id' => $pcigara->id,
            'code'       => 'PCGRPUTIH',
            'name'    => 'Putih Polos',
            'barcode'    => BarcodeHelper::generate(),
            'stock'      => 200,
        ]);

        Discount::create(['product_id' => $pcigara->id, 'min_qty' => 12, 'normal_price' => 22000, 'customer_price' => 18500]);
        Discount::create(['product_id' => $pcigara->id, 'min_qty' => 48, 'normal_price' => 20000, 'customer_price' => 17000]);

        $tasbihkayu = Product::create([
            'name'           => 'Tasbih Kayu',
            'normal_price'   => 35000,
            'customer_price' => 28000,
        ]);
        $tasbihkayu99 = Variant::create([
            'product_id' => $tasbihkayu->id,
            'code'       => 'TSBHKYU99',
            'name'    => '99 Biji Cokelat',
            'barcode'    => BarcodeHelper::generate(),
            'stock'      => 85,
        ]);

        Discount::create(['product_id' => $tasbihkayu->id, 'min_qty' => 10, 'normal_price' => 30000, 'customer_price' => 25000]);

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
        SaleItem::create(['sale_id' => $s1->id, 'variant_id' => $alsibgswmx->id, 'price' => $alsibgsw->customer_price, 'qty' => 4,  'discount' => 0, 'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s1->id, 'variant_id' => $atshtm790->id,  'price' => $atshtm->customer_price,   'qty' => 2,  'discount' => 0, 'type' => 'Sell']);

        // Sale 2 — Asep, 26 Apr (bulk, triggers discount tier)
        $s2 = Sale::create(['date' => '2026-04-26', 'time' => '09:08:56', 'customer_name' => $asep->name, 'status' => 'Fixed']);
        SaleItem::create(['sale_id' => $s2->id, 'variant_id' => $alsibgswmx->id, 'price' => 62500, 'qty' => 10, 'discount' => 0, 'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s2->id, 'variant_id' => $atshtm790->id,  'price' => $atshtm->customer_price, 'qty' => 2,  'discount' => 0, 'type' => 'Sell']);

        // Sale 3 — Budi, 24 Apr (large order)
        $s3 = Sale::create(['date' => '2026-04-24', 'time' => '10:57:00', 'customer_name' => $budi->name, 'status' => 'Fixed']);
        SaleItem::create(['sale_id' => $s3->id, 'variant_id' => $atshtm790->id, 'price' => 40000, 'qty' => 30, 'discount' => 0, 'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s3->id, 'variant_id' => $wdmjqahtm->id, 'price' => 50000, 'qty' => 50, 'discount' => 0, 'type' => 'Sell']);

        // Sale 4 — Cindy (walk-in, not registered)
        $s4 = Sale::create(['date' => '2026-04-25', 'time' => '17:05:11', 'customer_name' => 'Cindy', 'status' => 'Fixed']);
        SaleItem::create(['sale_id' => $s4->id, 'variant_id' => $wdmjqahtm->id, 'price' => $wdmjqa->normal_price, 'qty' => 5, 'discount' => 0, 'type' => 'Sell']);

        // Sale 5 — Dewi, bulk peci
        $s5 = Sale::create(['date' => '2026-04-23', 'time' => '14:22:30', 'customer_name' => $dewi->name, 'status' => 'Fixed']);
        SaleItem::create(['sale_id' => $s5->id, 'variant_id' => $pcigaraputih->id, 'price' => 18500, 'qty' => 48, 'discount' => 0, 'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s5->id, 'variant_id' => $tasbihkayu99->id, 'price' => 25000, 'qty' => 10, 'discount' => 0, 'type' => 'Sell']);

        // Sale 6 — Hendra
        $s6 = Sale::create(['date' => '2026-04-22', 'time' => '11:10:00', 'customer_name' => $hendra->name, 'status' => 'Fixed']);
        SaleItem::create(['sale_id' => $s6->id, 'variant_id' => $alsibgswmx->id,   'price' => $alsibgsw->normal_price,   'qty' => 3, 'discount' => 0,    'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s6->id, 'variant_id' => $pcigaraputih->id, 'price' => $pcigara->normal_price,    'qty' => 6, 'discount' => 2000, 'type' => 'Sell']);

        // Sale 7 — Budi, with return
        $s7 = Sale::create(['date' => '2026-04-26', 'time' => '15:30:00', 'customer_name' => $budi->name, 'status' => 'Fixed']);
        SaleItem::create(['sale_id' => $s7->id, 'variant_id' => $wdmjqahtm->id, 'price' => 54000, 'qty' => 20, 'discount' => 0, 'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s7->id, 'variant_id' => $wdmjqahtm->id, 'price' => 54000, 'qty' => 2,  'discount' => 0, 'type' => 'Return']);

        // Sale 8 — Dewi, tasbih grosir
        $s8 = Sale::create(['date' => '2026-04-21', 'time' => '08:45:00', 'customer_name' => $dewi->name, 'status' => 'Fixed']);
        SaleItem::create(['sale_id' => $s8->id, 'variant_id' => $tasbihkayu99->id, 'price' => 25000, 'qty' => 20, 'discount' => 0, 'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s8->id, 'variant_id' => $alsibgswmx->id,   'price' => 62500, 'qty' => 15, 'discount' => 0, 'type' => 'Sell']);

        // Sale 9 — walk-in (no customer name), draft
        $s9 = Sale::create(['date' => '2026-04-26', 'time' => '16:48:22', 'customer_name' => null, 'status' => 'Draft']);
        SaleItem::create(['sale_id' => $s9->id, 'variant_id' => $atshtm790->id,    'price' => $atshtm->normal_price,  'qty' => 1, 'discount' => 0, 'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s9->id, 'variant_id' => $pcigaraputih->id, 'price' => $pcigara->normal_price, 'qty' => 2, 'discount' => 0, 'type' => 'Sell']);

        // Sale 10 — Hendra, mixed items with discount
        $s10 = Sale::create(['date' => '2026-04-20', 'time' => '13:00:00', 'customer_name' => $hendra->name, 'status' => 'Fixed']);
        SaleItem::create(['sale_id' => $s10->id, 'variant_id' => $wdmjqahtm->id,   'price' => $wdmjqa->normal_price,    'qty' => 4,  'discount' => 5000, 'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s10->id, 'variant_id' => $tasbihkayu99->id, 'price' => $tasbihkayu->normal_price,'qty' => 5,  'discount' => 0,    'type' => 'Sell']);
        SaleItem::create(['sale_id' => $s10->id, 'variant_id' => $pcigaraputih->id, 'price' => $pcigara->normal_price,   'qty' => 12, 'discount' => 0,    'type' => 'Sell']);
    }
}
