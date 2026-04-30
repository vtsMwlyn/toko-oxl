<?php

namespace App\Http\Controllers;

use App\Helpers\BarcodeHelper;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Variant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierController extends Controller
{
    public function index()
    {
        return Inertia::render('Cashier/Index', [
            'products' => Product::with(['variants', 'discounts'])->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date'               => 'required|date',
            'time'               => 'required',
            'customer_name'      => 'nullable|string|max:255',
            'status'             => 'required|in:Draft,Fixed',
            'items'              => 'required|array|min:1',
            'items.*.variant_id' => 'required|integer|exists:variants,id',
            'items.*.price'      => 'required|numeric|min:0',
            'items.*.qty'        => 'required|integer|min:1',
            'items.*.discount'   => 'nullable|numeric|min:0',
            'items.*.type'       => 'required|in:Sell,Return',
        ]);

        $sale = Sale::create($request->only('date', 'time', 'customer_name', 'status'));

        $variantIds = collect($request->items)->pluck('variant_id')->unique();
        $variants   = Variant::whereIn('id', $variantIds)->get()->keyBy('id');

        foreach ($request->items as $item) {
            $variant = $variants->get($item['variant_id']);
            $sale->items()->create([
                'variant_id' => $variant->id,
                'price'      => $item['price'],
                'discount'   => $item['discount'] ?? 0,
                'qty'        => $item['qty'],
                'type'       => $item['type'],
            ]);
        }

        return back();
    }

    public function barcode_scanner_test(){
        return Inertia::render('Cashier/BarcodeScannerTest', [
            'barcode' => BarcodeHelper::generate(),
        ]);
    }
}
