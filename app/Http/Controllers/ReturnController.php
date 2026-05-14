<?php

namespace App\Http\Controllers;

use App\Helpers\ModelChangeLogger;
use App\Models\ActionLog;
use App\Models\Product;
use App\Models\ProductReturn;
use App\Models\Variant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

        DB::transaction(function () use ($validated) {
            $return = ProductReturn::create($validated);
            $return->load('variant.product');

            // Add returned qty to the variant
            $variant = $return->variant;
            $variant->stock += $return->qty;
            $variant->save();

            $productName = $variant->product->name ?? 'Unknown';
            $variantName = $variant->name ? " ({$variant->name})" : '';

            ActionLog::create([
                'user_id' => Auth::id(),
                'message' => "Menambahkan retur produk {$productName}{$variantName} tanggal {$return->date} sebanyak {$return->qty} pcs.",
            ]);
        });

        return back();
    }

    public function update(Request $request, ProductReturn $return)
    {
        $validated = $request->validate([
            'date'       => 'required|date',
            'variant_id' => 'required|integer|exists:variants,id',
            'qty'        => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($request, $return, $validated) {
            $return->load('variant.product');

            $oldVariantId = $return->variant_id;
            $oldQty = $return->qty;

            $productName = $return->variant->product->name ?? 'Unknown';
            $variantName = $return->variant->name ? " ({$return->variant->name})" : '';

            $changes = ModelChangeLogger::getChanges($return, $validated);

            $return->update($validated);

            // Handle Variant Quantity Adjustment
            if ($oldVariantId == $validated['variant_id']) {
                // If the variant remains the same, calculate the difference
                $qtyDifference = $validated['qty'] - $oldQty;

                if ($qtyDifference != 0) {
                    $return->variant->stock += $qtyDifference;
                    $return->variant->save();
                }
            } else {
                // If the variant changed, subtract from the old one and add to the new one
                $oldVariant = Variant::find($oldVariantId);
                if ($oldVariant) {
                    $oldVariant->qty -= $oldQty;
                    $oldVariant->save();
                }

                $return->load('variant'); // Refresh relationship
                $return->variant->stock += $validated['qty'];
                $return->variant->save();
            }

            if (!empty($changes)) {
                ActionLog::create([
                    'user_id' => Auth::id(),
                    'message' => "Memperbarui retur produk {$productName}{$variantName} tanggal {$return->date}.",
                    'changes' => $changes,
                ]);
            }
        });

        return back();
    }

    public function destroy(ProductReturn $return)
    {
        DB::transaction(function () use ($return) {
            $return->load('variant.product');

            // Subtract the returned qty back out of the variant before deleting
            $variant = $return->variant;
            $variant->stock -= $return->qty;
            $variant->save();

            $productName = $variant->product->name ?? 'Unknown';
            $variantName = $variant->name ? " ({$variant->name})" : '';

            ActionLog::create([
                'user_id' => Auth::id(),
                'message' => "Menghapus retur produk {$productName}{$variantName} tanggal {$return->date} sebanyak {$return->qty} pcs.",
            ]);

            $return->delete();
        });

        return back();
    }
}
