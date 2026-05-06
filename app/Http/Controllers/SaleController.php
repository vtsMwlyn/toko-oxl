<?php

namespace App\Http\Controllers;

use App\Exports\SaleByProductExport;
use App\Exports\SaleBySaleExport;
use App\Exports\SaleBySpecificProductExport;
use App\Helpers\ModelChangeLogger;
use App\Models\ActionLog;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Helpers\SaleItemChangeLogger;

class SaleController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Sale/Index', [
            'sales' => Sale::with('items.variant.product')->orderByDesc('date')->orderByDesc('time')->get()
                ->map(fn($sale) => array_merge($sale->toArray(), [
                    'total' => $sale->items->reduce(function ($carry, $item) {
                        $subtotal = ($item->price - ($item->discount ?? 0)) * $item->qty;
                        return $carry + ($item->type === 'Sell' ? $subtotal : -$subtotal);
                    }, 0),
                ])),
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
            'items'              => 'required|array',
            'items.*.variant_id' => 'required|integer|exists:variants,id',
            'items.*.price'      => 'required|numeric|min:0',
            'items.*.qty'        => 'required|integer|min:1',
            'items.*.discount'   => 'nullable|numeric|min:0',
            'items.*.type'       => 'required|in:Sell,Return',
        ]);

        $lastSale = Sale::where('date', $validatedData['date'])->orderBy('time', 'desc')->first();

        $sale = Sale::create([
            'date' => $validatedData['date'],
            'time' => $validatedData['time'],
            'customer_name' => $validatedData['customer_name'],
            'status' => $validatedData['status'],
            'queue_number' => $lastSale ? ((int) $lastSale->queue_number + 1) : 1,
        ]);

        $this->syncItems($sale, $request->items ?? []);

        return back();
    }

    public function update(Request $request, Sale $sale)
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

        // 1. Track sale field changes
        $changes = ModelChangeLogger::getChanges($sale, $validatedData);

        // 2. Track item changes BEFORE DB mutation
        $itemChanges = SaleItemChangeLogger::diff(
            $sale->items,
            collect($validatedData['items'] ?? [])
        );

        // Merge
        $changes = array_merge($changes, $itemChanges);

        // 3. Persist
        $sale->update([
            'date' => $validatedData['date'],
            'time' => $validatedData['time'],
            'customer_name' => $validatedData['customer_name'],
            'status' => $validatedData['status'],
        ]);

        $sale->items()->delete();
        $this->syncItems($sale, $validatedData['items'] ?? []);

        // 4. Log
        if (!empty($changes)) {
            ActionLog::create([
                'user_id' => Auth::id(),
                'message' => 'Memperbaharui data penjualan '
                    . $sale->date . ' '
                    . $sale->time . ' antrian '
                    . $sale->queue_number,
                'changes' => $changes,
            ]);
        }

        return back();
    }

    public function destroy(Sale $sale)
    {
        $sale->items()->delete();
        $sale->delete();

        return back();
    }

    public function set_fixed(Sale $sale){
        $sale->update(['status' => 'Fixed']);

        ActionLog::create([
            'user_id' => Auth::id(),
            'message' => 'Mengubah status penjualan ' . $sale->date . ' ' . $sale->time . ' antrian ' . $sale->queue_number . ' atas nama ' . $sale->customer_name . ' menjadi Fixed.',
        ]);

        return back();
    }

    public function exportByProduct() {
        $filename = 'penjualan_per_produk_' . now()->format('Ymd_His') . '.xlsx';
        return Excel::download(new SaleByProductExport, $filename);
    }

    public function exportBySpecificProduct(Product $product)
    {
        $filename = 'penjualan_' . str($product->name)->slug('_') . '_' . now()->format('Ymd_His') . '.xlsx';
        return Excel::download(new SaleBySpecificProductExport($product), $filename);
    }

    public function exportBySale() {
        $filename = 'penjualan_per_transaksi_' . now()->format('Ymd_His') . '.xlsx';
        return Excel::download(new SaleBySaleExport, $filename);
    }

    // ── Private helper ────────────────────────────────────────────────────────

    private function syncItems(Sale $sale, array $items): void
    {
        foreach ($items as $item) {
            $sale->items()->create([
                'variant_id' => $item['variant_id'],
                'price'      => $item['price'],
                'discount'   => $item['discount'] ?? 0,
                'qty'        => $item['qty'],
                'type'       => $item['type'],
            ]);
        }
    }
}
