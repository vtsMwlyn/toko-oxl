<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            'type'               => 'required|in:Offline,Online',
            'items'              => 'array',
            'items.*.variant_id' => 'required|integer|exists:variants,id',
            'items.*.price'      => 'required|numeric|min:0',
            'items.*.qty'        => 'required|integer|min:1',
            'items.*.discount'   => 'nullable|numeric|min:0',
            'items.*.type'       => 'required|in:Sell,Return',
        ]);

        $lastSale = Sale::where('date', Carbon::today()->format('Y-m-d'))->orderBy('time', 'desc')->first();

        $sale = Sale::create([
            'user_id'       => Auth::id(),
            'date'          => $validatedData['date'],
            'time'          => $validatedData['time'],
            'customer_name' => $validatedData['customer_name'],
            'status'        => $validatedData['status'],
            'type'          => $validatedData['type'],
            'queue_number'  => $lastSale ? ((int) $lastSale->queue_number + 1) : 1,
        ]);

        foreach ($validatedData['items'] as $item) {
            $sale->items()->create([
                'variant_id' => $item['variant_id'],
                'price'      => $item['price'],
                'discount'   => $item['discount'] ?? 0,
                'qty'        => $item['qty'],
                'type'       => $item['type'],
            ]);
        }

        return back()->with('queue_number', $sale->queue_number);
    }
}
