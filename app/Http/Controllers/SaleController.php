<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Sale/Index', [
            'sales' => Sale::with('items')->orderByDesc('date')->orderByDesc('time')->get()
                ->map(fn($sale) => array_merge($sale->toArray(), [
                    'total' => $sale->items->reduce(function ($carry, $item) {
                        $subtotal = ($item->price - ($item->discount ?? 0)) * $item->qty;
                        return $carry + ($item->type === 'Sell' ? $subtotal : -$subtotal);
                    }, 0),
                ])),
            'products' => Product::with(['discounts'])->orderBy('name', 'asc')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date'               => 'required|date',
            'time'               => 'required',
            'customer_name'      => 'nullable|string|max:255',
            'status'             => 'required|in:draft,fixed',
            'items'              => 'array',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.price'      => 'required|numeric|min:0',
            'items.*.qty'        => 'required|integer|min:1',
            'items.*.discount'   => 'nullable|numeric|min:0',
            'items.*.type'       => 'required|in:Sell,Return',
        ]);

        $sale = Sale::create($request->only('date', 'time', 'customer_name', 'status'));

        $this->syncItems($sale, $request->items ?? []);

        return back();
    }

    public function update(Request $request, Sale $sale)
    {
        $request->validate([
            'date'               => 'required|date',
            'time'               => 'required',
            'customer_name'      => 'nullable|string|max:255',
            'status'             => 'required|in:draft,fixed',
            'items'              => 'array',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.price'      => 'required|numeric|min:0',
            'items.*.qty'        => 'required|integer|min:1',
            'items.*.discount'   => 'nullable|numeric|min:0',
            'items.*.type'       => 'required|in:Sell,Return',
        ]);

        $sale->update($request->only('date', 'time', 'customer_name', 'status'));

        $sale->items()->delete();
        $this->syncItems($sale, $request->items ?? []);

        return back();
    }

    public function destroy(Sale $sale)
    {
        $sale->items()->delete();
        $sale->delete();

        return back();
    }

    // ── Private helper ────────────────────────────────────────────────────────

    private function syncItems(Sale $sale, array $items): void
    {
        $productIds = collect($items)->pluck('product_id')->unique();
        $products   = Product::whereIn('id', $productIds)->get()->keyBy('id');

        foreach ($items as $item) {
            $product = $products->get($item['product_id']);

            $sale->items()->create([
                'product_id' => $product->id,
                'price'      => $item['price'],   // user-confirmed price (may differ from catalogue)
                'discount'   => $item['discount'] ?? 0,
                'qty'        => $item['qty'],
                'type'       => $item['type'],
            ]);
        }
    }
}
