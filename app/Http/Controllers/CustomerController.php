<?php

namespace App\Http\Controllers;

use App\Helpers\ModelChangeLogger;
use App\Models\ActionLog;
use App\Models\Customer;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $customers = Customer::orderBy('name')
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('name',  'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            }))
            ->paginate(20)->through(function ($customer) {
            $sales = Sale::where('customer_name', $customer->name)
                ->where('status', 'Fixed')
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

            return array_merge($customer->toArray(), [
                'sales'       => $sales,
                'total_sales' => $sales->count(),
                'total_omzet' => $sales->sum('total'),
            ]);
        });

        return Inertia::render('Admin/Customer/Index', [
            'customers' => $customers,
            'search'    => $search,
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

        return back()->with('success', 'Pelanggan berhasil ditambahkan.');
    }

    public function show(Customer $customer)
    {
        // Load sales where customer_name matches this customer's name
        $sales = Sale::where('customer_name', $customer->name)
            ->where('status', 'Fixed')
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
        $validatedData = $request->validate([
            'name'    => 'required|string|max:255',
            'phone'   => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'notes'   => 'nullable|string|max:1000',
        ]);

        $changes = ModelChangeLogger::getChanges($customer, $validatedData);

        $customer->update($validatedData);

        if (!empty($changes)) {
            ActionLog::create([
                'user_id' => Auth::id(),
                'message' => 'Memperbaharui data ' . $customer->name,
                'changes' => $changes,
            ]);
        }

        return back()->with('success', 'Pelanggan berhasil diperbarui.');
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();

        return back()->with('success', 'Pelanggan berhasil dihapus.');
    }
}
