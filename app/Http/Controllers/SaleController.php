<?php

namespace App\Http\Controllers;

use App\Exports\SaleByProductExport;
use App\Exports\SaleBySaleExport;
use App\Exports\SaleBySpecificProductExport;
use App\Exports\SaleBySpecificVariantExport;
use App\Helpers\ModelChangeLogger;
use App\Helpers\SaleItemChangeLogger;
use App\Models\ActionLog;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Variant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $from = $request->input('from');
        $to   = $request->input('to');

        $mapSale = fn ($sale) => array_merge($sale->toArray(), [
            'total' => $sale->items->reduce(function ($carry, $item) {
                $subtotal = ($item->price - ($item->discount ?? 0)) * $item->qty;
                return $carry + ($item->type === 'Sell' ? $subtotal : -$subtotal);
            }, 0),
            'cashier_name' => $sale->user?->name,
        ]);

        $baseQuery = fn () => Sale::with('items.variant.product', 'user')
            ->when($user->role !== 'Admin', fn ($q) => $q->where('user_id', $user->id));

        $todaySales = $baseQuery()
            ->where('date', today()->toDateString())
            ->orderByDesc('time')
            ->get()
            ->map($mapSale);

        $historyQuery = $baseQuery()->orderByDesc('date')->orderByDesc('time');
        if ($from) $historyQuery->where('date', '>=', $from);
        if ($to)   $historyQuery->where('date', '<=', $to);
        $historySales = $historyQuery->paginate(20)->through($mapSale);

        return Inertia::render('Admin/Sale/Index', [
            'today_sales'   => $todaySales,
            'history_sales' => $historySales,
            'from'          => $from,
            'to'            => $to,
            'products'      => Product::with(['variants', 'discounts'])->orderBy('name')->get(),
            'customers'     => Customer::orderBy('name')->get(['id', 'name', 'phone']),
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
            'items'              => 'required|array',
            'items.*.variant_id' => 'required|integer|exists:variants,id',
            'items.*.price'      => 'required|numeric|min:0',
            'items.*.qty'        => 'required|integer|min:1',
            'items.*.discount'   => 'nullable|numeric|min:0',
            'items.*.type'       => 'required|in:Sell,Return',
        ]);

        $lastSale = Sale::where('date', $validatedData['date'])->orderBy('time', 'desc')->first();

        $sale = Sale::create([
            'user_id'       => Auth::id(),
            'date'          => $validatedData['date'],
            'time'          => $validatedData['time'],
            'customer_name' => $validatedData['customer_name'],
            'status'        => $validatedData['status'],
            'type'          => $validatedData['type'],
            'queue_number'  => $lastSale ? ((int) $lastSale->queue_number + 1) : 1,
        ]);

        $this->syncItems($sale, $request->items ?? []);

        if ($validatedData['status'] === 'Fixed') {
            $this->applyStockDelta($request->items ?? [], +1);
        }

        return back()->with('success', 'Penjualan berhasil disimpan.');
    }

    public function update(Request $request, Sale $sale)
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

        // 1. Track sale field changes
        $changes = ModelChangeLogger::getChanges($sale, $validatedData);

        // 2. Track item changes BEFORE DB mutation
        $itemChanges = SaleItemChangeLogger::diff(
            $sale->items,
            collect($validatedData['items'] ?? [])
        );

        // Merge
        $changes = array_merge($changes, $itemChanges);

        // 3. Lock fields for cashiers: date/time always, status only when already Fixed
        if (Auth::user()->role !== 'Admin') {
            $validatedData['date'] = $sale->date;
            $validatedData['time'] = $sale->time;
            if ($sale->status === 'Fixed') {
                $validatedData['status'] = $sale->status;
            }
        }

        $oldStatus = $sale->status;
        $newStatus = $validatedData['status'];

        if ($oldStatus === 'Fixed') {
            $sale->load('items');
            $this->applyStockDelta($sale->items, -1);
        }

        $sale->update([
            'date'          => $validatedData['date'],
            'time'          => $validatedData['time'],
            'customer_name' => $validatedData['customer_name'],
            'status'        => $newStatus,
            'type'          => $validatedData['type'],
        ]);

        $sale->items()->delete();
        $this->syncItems($sale, $validatedData['items'] ?? []);

        if ($newStatus === 'Fixed') {
            $this->applyStockDelta($validatedData['items'] ?? [], +1);
        }

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

        return back()->with('success', 'Penjualan berhasil diperbarui.');
    }

    public function destroy(Sale $sale)
    {
        if ($sale->status === 'Fixed') {
            $sale->load('items');
            $this->applyStockDelta($sale->items, -1);
        }

        $sale->items()->delete();
        $sale->delete();

        return back()->with('success', 'Penjualan berhasil dihapus.');
    }

    public function destroyBatch(Request $request)
    {
        $validated = $request->validate([
            'ids'   => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:sales,id'],
        ]);

        $sales = Sale::with('items')->whereIn('id', $validated['ids'])->get();

        foreach ($sales as $sale) {
            if ($sale->status === 'Fixed') {
                $this->applyStockDelta($sale->items, -1);
            }
            $sale->items()->delete();
            $sale->delete();
        }

        return back()->with('success', 'Penjualan berhasil dihapus.');
    }

    public function set_fixed(Sale $sale)
    {
        $sale->load('items');
        $this->applyStockDelta($sale->items, +1);

        $sale->update(['status' => 'Fixed']);

        ActionLog::create([
            'user_id' => Auth::id(),
            'message' => 'Mengubah status penjualan ' . $sale->date . ' ' . $sale->time . ' antrian ' . $sale->queue_number . ' atas nama ' . $sale->customer_name . ' menjadi Fixed.',
        ]);

        return back()->with('success', 'Status penjualan diubah menjadi Fixed.');
    }

    public function destroyByRange(Request $request)
    {
        $validated = $request->validate([
            'from'          => ['required', 'date'],
            'to'            => ['required', 'date', 'after_or_equal:from'],
            'customer_name' => ['nullable', 'string'],
        ]);

        $sales = Sale::with('items')
            ->whereDate('date', '>=', $validated['from'])
            ->whereDate('date', '<=', $validated['to'])
            ->when($validated['customer_name'] ?? null, fn ($q, $name) => $q->where('customer_name', $name))
            ->get();

        $count = $sales->count();

        foreach ($sales as $sale) {
            if ($sale->status === 'Fixed') {
                $this->applyStockDelta($sale->items, -1);
            }
            $sale->items()->delete();
            $sale->delete();
        }

        return back()->with('success', "{$count} penjualan berhasil dihapus.");
    }

    public function exportByProduct(Request $request)
    {
        $percent  = (float) $request->input('qty_percent', 100);
        $percent  = max(1, min(100, $percent));
        $from     = $request->input('from');
        $to       = $request->input('to');
        $filename = 'penjualan_per_produk_' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new SaleByProductExport($percent, $from, $to), $filename);
    }

    public function exportBySpecificProduct(Request $request, Variant $variant)
    {
        $percent  = (float) $request->input('qty_percent', 100);
        $percent  = max(1, min(100, $percent));
        $from     = $request->input('from');
        $to       = $request->input('to');
        $filename = 'penjualan_' . str($variant->product->name)->slug('_') . '_' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new SaleBySpecificVariantExport($variant, $percent, $from, $to), $filename);
    }

    public function exportBySpecificProductGroup(Request $request, Product $product)
    {
        $percent  = (float) $request->input('qty_percent', 100);
        $percent  = max(1, min(100, $percent));
        $from     = $request->input('from');
        $to       = $request->input('to');
        $filename = 'penjualan_' . str($product->name)->slug('_') . '_semua_varian_' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new SaleBySpecificProductExport($product, $percent, $from, $to), $filename);
    }

    public function exportBySale(Request $request)
    {
        $percent  = (float) $request->input('qty_percent', 100);
        $percent  = max(1, min(100, $percent));
        $from     = $request->input('from');
        $to       = $request->input('to');
        $filename = 'penjualan_per_transaksi_' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new SaleBySaleExport($percent, $from, $to), $filename);
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

    // $sign = +1 to apply (store), -1 to reverse (update/delete)
    private function applyStockDelta(iterable $items, int $sign): void
    {
        foreach ($items as $item) {
            [$variantId, $qty, $type] = is_array($item)
                ? [$item['variant_id'], $item['qty'], $item['type']]
                : [$item->variant_id,  $item->qty,   $item->type];

            $delta = ($type === 'Sell' ? -$qty : $qty) * $sign;
            Variant::where('id', $variantId)->increment('stock', $delta);
        }
    }
}
