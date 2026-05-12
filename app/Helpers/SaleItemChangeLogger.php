<?php

namespace App\Helpers;

use App\Models\Variant;
use Illuminate\Support\Collection;

class SaleItemChangeLogger
{
    public static function diff(Collection $oldItems, Collection $newItems): array
    {
        $changes = [];

        // Build lookup maps keyed by variant_id only.
        $oldMap = self::toMap($oldItems, isEloquent: true);
        $newMap = self::toMap($newItems, isEloquent: false);

        // Preload all variant+product names needed in one query.
        $allVariantIds = collect(array_keys($oldMap))
            ->merge(array_keys($newMap))
            ->unique()
            ->values()
            ->all();

        $variants = Variant::with('product')
            ->whereIn('id', $allVariantIds)
            ->get()
            ->keyBy('id');

        // ➕ Added (in new, not in old)
        foreach ($newMap as $variantId => $newItem) {
            if (!isset($oldMap[$variantId])) {
                $variant = $variants[$variantId] ?? null;

                $changes[] = [
                    'type'         => 'added',
                    'variant_id'   => (int) $variantId,
                    'variant_name' => $variant?->name,
                    'product_name' => $variant?->product?->name,
                    'new'          => $newItem,
                ];
            }
        }

        // ❌ Removed (in old, not in new)
        foreach ($oldMap as $variantId => $oldItem) {
            if (!isset($newMap[$variantId])) {
                $variant = $variants[$variantId] ?? null;

                $changes[] = [
                    'type'         => 'removed',
                    'variant_id'   => (int) $variantId,
                    'variant_name' => $variant?->name,
                    'product_name' => $variant?->product?->name,
                    'old'          => $oldItem instanceof \Illuminate\Database\Eloquent\Model
                                        ? $oldItem->toArray()
                                        : $oldItem,
                ];
            }
        }

        // 🔄 Updated (in both, fields changed)
        foreach ($newMap as $variantId => $newItem) {
            if (!isset($oldMap[$variantId])) {
                continue; // already handled as added
            }

            $variant = $variants[$variantId] ?? null;
            $oldItem = $oldMap[$variantId];

            foreach (['price', 'qty', 'discount'] as $field) {
                $oldValue = $oldItem instanceof \Illuminate\Database\Eloquent\Model
                    ? $oldItem->$field
                    : ($oldItem[$field] ?? null);

                $newValue = $newItem[$field] ?? null;

                // Cast to same type before comparing to avoid "100" != 100 false positives.
                if ((string) $oldValue !== (string) $newValue) {
                    $changes[] = [
                        'type'         => 'updated',
                        'variant_id'   => (int) $variantId,
                        'variant_name' => $variant?->name,
                        'product_name' => $variant?->product?->name,
                        'field'        => $field,
                        'old'          => $oldValue,
                        'new'          => $newValue,
                    ];
                }
            }
        }

        return $changes;
    }

    /**
     * Build a map keyed by variant_id.
     */
    private static function toMap(Collection $items, bool $isEloquent): array
    {
        $map = [];

        foreach ($items as $item) {
            $variantId       = $isEloquent ? $item->variant_id : $item['variant_id'];
            $map[$variantId] = $item;
        }

        return $map;
    }
}
