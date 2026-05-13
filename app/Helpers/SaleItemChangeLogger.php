<?php

namespace App\Helpers;

use App\Models\Variant;
use Illuminate\Support\Collection;

class SaleItemChangeLogger
{
    public static function diff(Collection $oldItems, Collection $newItems): array
    {
        $changes = [];

        // Build lookup maps keyed by "variant_id|type" to support
        // the same variant appearing as both Sell and Return.
        $oldMap = self::toMap($oldItems, isEloquent: true);
        $newMap = self::toMap($newItems, isEloquent: false);

        // Preload all variant+product names needed in one query
        $allVariantIds = collect(array_keys($oldMap))
            ->merge(array_keys($newMap))
            ->map(fn($k) => explode('|', $k)[0])
            ->unique()
            ->values()
            ->all();

        $variants = Variant::with('product')
            ->whereIn('id', $allVariantIds)
            ->get()
            ->keyBy('id');

        // ➕ Added (in new, not in old)
        foreach ($newMap as $key => $newItem) {
            if (!isset($oldMap[$key])) {
                [$variantId] = explode('|', $key);
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
        foreach ($oldMap as $key => $oldItem) {
            if (!isset($newMap[$key])) {
                [$variantId] = explode('|', $key);
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
        foreach ($newMap as $key => $newItem) {
            if (!isset($oldMap[$key])) {
                continue; // already handled as added
            }

            [$variantId] = explode('|', $key);
            $variant  = $variants[$variantId] ?? null;
            $oldItem  = $oldMap[$key];

            foreach (['price', 'qty', 'discount', 'type'] as $field) {
                $oldValue = $oldItem instanceof \Illuminate\Database\Eloquent\Model
                    ? $oldItem->$field
                    : ($oldItem[$field] ?? null);

                $newValue = $newItem[$field] ?? null;

                // Cast to same type before comparing to avoid "100" != 100 false positives
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
     * Build a map keyed by "variant_id|type" so the same variant
     * can appear as both Sell and Return without collision.
     */
    private static function toMap(Collection $items, bool $isEloquent): array
    {
        $map = [];

        foreach ($items as $item) {
            $variantId = $isEloquent ? $item->variant_id : $item['variant_id'];
            $type      = $isEloquent ? $item->type       : $item['type'];
            $key       = "{$variantId}|{$type}";
            $map[$key] = $item;
        }

        return $map;
    }
}
