<?php

namespace App\Http\Controllers;

use App\Helpers\BarcodeHelper;
use App\Models\Sale;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierController extends Controller
{
    public function index()
    {
        return Inertia::render('Cashier/Index', [
            'products' => Product::with(['discounts'])->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date'               => 'required|date',
            'time'               => 'required',
            'customer_name'      => 'nullable|string|max:255',
            'status'             => 'required|in:Draft,fixed',
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.price'      => 'required|numeric|min:0',
            'items.*.qty'        => 'required|integer|min:1',
            'items.*.discount'   => 'nullable|numeric|min:0',
            'items.*.type'       => 'required|in:Sell,Return',
        ]);

        $sale = Sale::create($request->only('date', 'time', 'customer_name', 'status'));

        $productIds = collect($request->items)->pluck('product_id')->unique();
        $products   = Product::whereIn('id', $productIds)->get()->keyBy('id');

        foreach ($request->items as $item) {
            $product = $products->get($item['product_id']);
            $sale->items()->create([
                'product_id' => $product->id,
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
