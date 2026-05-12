<?php

namespace App\Http\Controllers;

use App\Helpers\ModelChangeLogger;
use App\Models\ActionLog;
use App\Models\Product;
use App\Models\ProductReturn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReturnController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Return/Index', [
            'returns'  => ProductReturn::with('variant.product')
                ->orderByDesc('date')
                ->orderByDesc('id')
                ->get(),
            'products' => Product::with('variants')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'       => 'required|date',
            'variant_id' => 'required|integer|exists:variants,id',
            'qty'        => 'required|integer|min:1',
        ]);

        $return = ProductReturn::create($validated);
        $return->load('variant.product');

        $productName = $return->variant->product->name ?? 'Unknown';
        $variantName = $return->variant->name ? " ({$return->variant->name})" : '';

        ActionLog::create([
            'user_id' => Auth::id(),
            'message' => "Menambahkan retur produk {$productName}{$variantName} tanggal {$return->date} sebanyak {$return->qty} pcs.",
        ]);

        return back();
    }

    public function update(Request $request, ProductReturn $return)
    {
        $validated = $request->validate([
            'date'       => 'required|date',
            'variant_id' => 'required|integer|exists:variants,id',
            'qty'        => 'required|integer|min:1',
        ]);

        $return->load('variant.product');
        $productName = $return->variant->product->name ?? 'Unknown';
        $variantName = $return->variant->name ? " ({$return->variant->name})" : '';

        $changes = ModelChangeLogger::getChanges($return, $validated);

        $return->update($validated);

        if (!empty($changes)) {
            ActionLog::create([
                'user_id' => Auth::id(),
                'message' => "Memperbarui retur produk {$productName}{$variantName} tanggal {$return->date}.",
                'changes' => $changes,
            ]);
        }

        return back();
    }

    public function destroy(ProductReturn $return)
    {
        $return->load('variant.product');

        $productName = $return->variant->product->name ?? 'Unknown';
        $variantName = $return->variant->name ? " ({$return->variant->name})" : '';

        ActionLog::create([
            'user_id' => Auth::id(),
            'message' => "Menghapus retur produk {$productName}{$variantName} tanggal {$return->date} sebanyak {$return->qty} pcs.",
        ]);

        $return->delete();

        return back();
    }
}
