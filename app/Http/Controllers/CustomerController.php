<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Customer/Index', [
            'customers' => Customer::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'    => 'required|string|max:255',
            'phone'   => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'notes'   => 'nullable|string|max:1000',
        ]);

        Customer::create($request->only('name', 'phone', 'address', 'notes'));

        return back();
    }

    public function show(Customer $customer)
    {
        // Load sales where customer_name matches this customer's name
        $sales = Sale::where('customer_name', $customer->name)
            ->where('status', 'fixed')
            ->with('items')
            ->orderByDesc('date')
            ->orderByDesc('time')
            ->get()
            ->map(fn($sale) => array_merge($sale->toArray(), [
                'total' => $sale->items->reduce(function ($carry, $item) {
                    $subtotal = ($item->price - ($item->discount ?? 0)) * $item->qty;
                    return $carry + ($item->type === 'Sell' ? $subtotal : -$subtotal);
                }, 0),
            ]));

        return Inertia::render('Admin/Customer/Show', [
            'customer'      => $customer,
            'sales'         => $sales,
            'total_omzet'   => $sales->sum('total'),
            'total_sales'   => $sales->count(),
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $request->validate([
            'name'    => 'required|string|max:255',
            'phone'   => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'notes'   => 'nullable|string|max:1000',
        ]);

        $customer->update($request->only('name', 'phone', 'address', 'notes'));

        return back();
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();

        return back();
    }
}
