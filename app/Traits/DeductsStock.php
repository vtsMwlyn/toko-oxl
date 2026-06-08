<?php

namespace App\Traits;

use App\Models\ActionLog;
use App\Models\Sale;
use App\Models\Variant;
use Illuminate\Support\Facades\Auth;

trait DeductsStock
{
    /**
     * Apply stock delta for all items in a sale.
     *
     * $sign = +1 to apply (sale created/fixed), -1 to reverse (sale updated/deleted).
     * Pass $sale to trigger an ActionLog entry recording before/after stocks (only for +1).
     */
    protected function applyStockDelta(iterable $items, int $sign, ?Sale $sale = null): void
    {
        // Aggregate per variant so Sell + Return of same variant merge into one delta
        $deltas = [];
        foreach ($items as $item) {
            [$variantId, $qty, $type] = is_array($item)
                ? [$item['variant_id'], $item['qty'], $item['type']]
                : [$item->variant_id,  $item->qty,   $item->type];

            $delta = ($type === 'Sell' ? -$qty : $qty) * $sign;
            $deltas[$variantId] = ($deltas[$variantId] ?? 0) + $delta;
        }

        if (empty($deltas)) return;

        // When applying (+1) with a sale context, capture before/after for the audit log
        if ($sign === 1 && $sale !== null) {
            $variants = Variant::with('product')
                ->whereIn('id', array_keys($deltas))
                ->get()
                ->keyBy('id');

            $changes = [];
            foreach ($deltas as $variantId => $delta) {
                $variant  = $variants[$variantId] ?? null;
                $oldStock = $variant?->stock ?? 0;
                $changes[] = [
                    'type'         => 'stock',
                    'product_name' => $variant?->product?->name,
                    'variant_name' => $variant?->name,
                    'old'          => $oldStock,
                    'new'          => $oldStock + $delta,
                    'delta'        => $delta,
                ];
            }

            foreach ($deltas as $variantId => $delta) {
                Variant::where('id', $variantId)->increment('stock', $delta);
            }

            ActionLog::create([
                'user_id' => Auth::id(),
                'message' => 'Pengurangan stok dari penjualan '
                    . $sale->date . ' ' . $sale->time
                    . ' antrian ' . $sale->queue_number
                    . ($sale->customer_name ? ' a.n. ' . $sale->customer_name : ''),
                'changes' => $changes,
            ]);
        } else {
            foreach ($deltas as $variantId => $delta) {
                Variant::where('id', $variantId)->increment('stock', $delta);
            }
        }
    }
}
