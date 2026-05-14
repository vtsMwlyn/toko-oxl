<?php

namespace App\Http\Controllers;

use App\Helpers\BarcodeHelper;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Variant;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // Added DB facade
use Inertia\Inertia;

class CashierController extends Controller
{
    public function index()
    {
        return Inertia::render('Cashier/Index', [
            'products'  => Product::with(['variants', 'discounts'])->orderBy('name')->get(),
            'customers' => Customer::orderBy('name')->get(['id', 'name', 'phone']),
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'date'               => 'required|date',
            'time'               => 'required',
            'customer_name'      => 'nullable|string|max:255',
            'status'             => 'required|in:Draft,Fixed',
            'items'              => 'array',
            'items.*.variant_id' => 'required|integer|exists:variants,id',
            'items.*.price'      => 'required|numeric|min:0',
            'items.*.qty'        => 'required|integer|min:1',
            'items.*.discount'   => 'nullable|numeric|min:0',
            'items.*.type'       => 'required|in:Sell,Return',
        ]);

        DB::transaction(function () use ($validatedData) {
            $lastSale = Sale::where('date', Carbon::today()->format('Y-m-d'))->orderBy('time', 'desc')->first();

            $sale = Sale::create([
                'date'          => $validatedData['date'],
                'time'          => $validatedData['time'],
                'customer_name' => $validatedData['customer_name'],
                'status'        => $validatedData['status'],
                'queue_number'  => $lastSale ? ((int) $lastSale->queue_number + 1) : 1,
            ]);

            // Make sure items exist before looping
            if (!empty($validatedData['items'])) {
                foreach ($validatedData['items'] as $item) {
                    $sale->items()->create([
                        'variant_id' => $item['variant_id'],
                        'price'      => $item['price'],
                        'discount'   => $item['discount'] ?? 0,
                        'qty'        => $item['qty'],
                        'type'       => $item['type'],
                    ]);

                    // If the cashier marks this item as a Return, put the stock back!
                    if ($item['type'] === 'Return') {
                        Variant::where('id', $item['variant_id'])->increment('stock', $item['qty']);
                    }
                }
            }
        });

        return back();
    }
}
