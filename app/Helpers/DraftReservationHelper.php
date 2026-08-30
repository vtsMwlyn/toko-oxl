<?php

namespace App\Helpers;

use App\Models\SaleItem;
use Illuminate\Support\Collection;

class DraftReservationHelper
{
    /**
     * Returns a map of variant_id => total Sell qty reserved in Draft sales.
     *
     * @param  array       $variantIds     The variant IDs to query.
     * @param  int|null    $excludeSaleId  Exclude this sale's items (use when editing an existing draft).
     * @return array<int,int>
     */
    public static function getReservedQty(array $variantIds, ?int $excludeSaleId = null): array
    {
        if (empty($variantIds)) return [];

        return SaleItem::query()
            ->whereIn('variant_id', $variantIds)
            ->where('type', 'Sell')
            ->whereHas('sale', fn ($q) => $q->where('status', 'Draft'))
            ->when($excludeSaleId, fn ($q) => $q->where('sale_id', '!=', $excludeSaleId))
            ->selectRaw('variant_id, SUM(qty) as reserved')
            ->groupBy('variant_id')
            ->pluck('reserved', 'variant_id')
            ->map(fn ($v) => (int) $v)
            ->toArray();
    }

    /**
     * Augment a product collection's variants with a `draft_reserved` attribute.
     *
     * @param  Collection  $products       Eloquent collection of Product models with variants loaded.
     * @param  int|null    $excludeSaleId  Exclude this sale's items from the reservation count.
     * @return Collection
     */
    public static function augmentProducts(Collection $products, ?int $excludeSaleId = null): Collection
    {
        $variantIds = $products->flatMap(fn ($p) => $p->variants->pluck('id'))->all();

        $reservedMap = self::getReservedQty($variantIds, $excludeSaleId);

        $products->each(function ($product) use ($reservedMap) {
            $product->variants->each(function ($variant) use ($reservedMap) {
                $variant->draft_reserved = $reservedMap[$variant->id] ?? 0;
            });
        });

        return $products;
    }

    /**
     * Validate that Sell items in a request do not exceed available stock
     * (stock minus draft reservations by other sales).
     *
     * Returns null on success, or an error string describing the conflict.
     *
     * @param  array    $items          The items array from the request (each with variant_id, qty, type).
     * @param  int|null $excludeSaleId  Exclude this sale when computing reservations (for updates).
     * @return string|null
     */
    public static function validateStockAvailability(array $items, ?int $excludeSaleId = null): ?string
    {
        // Aggregate requested Sell qty per variant
        $requestedQty = [];
        foreach ($items as $item) {
            if (($item['type'] ?? '') !== 'Sell') continue;
            $vid = $item['variant_id'];
            $requestedQty[$vid] = ($requestedQty[$vid] ?? 0) + (int) $item['qty'];
        }

        if (empty($requestedQty)) return null;

        $variantIds  = array_keys($requestedQty);
        $reservedMap = self::getReservedQty($variantIds, $excludeSaleId);

        $conflicts = [];
        $variants  = \App\Models\Variant::with('product')->whereIn('id', $variantIds)->get()->keyBy('id');

        foreach ($requestedQty as $variantId => $qty) {
            $variant   = $variants[$variantId] ?? null;
            $reserved  = $reservedMap[$variantId] ?? 0;
            $available = ($variant?->stock ?? 0) - $reserved;

            if ($qty > $available) {
                $label = $variant
                    ? ($variant->product?->name . ' ' . $variant->name . ' [' . $variant->code . ']')
                    : "Variant #{$variantId}";
                $conflicts[] = "{$label}: diminta {$qty}, tersedia {$available}";
            }
        }

        return empty($conflicts) ? null : implode('; ', $conflicts);
    }
}
