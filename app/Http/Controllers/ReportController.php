<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $from = $request->input('from', now()->startOfMonth()->toDateString());
        $to   = $request->input('to',   now()->toDateString());

        // ── Omzet per day in range ────────────────────────────────────────────
        $sales = Sale::where('status', 'Fixed')
            ->whereBetween('date', [$from, $to])
            ->with('items')
            ->get();

        $omzetPerDay = $sales->groupBy('date')->map(function ($daySales, $date) {
            $total = $daySales->sum(fn($sale) =>
                $sale->items->reduce(fn($c, $i) =>
                    $c + ($i->type === 'Sell'
                        ?  ($i->price - $i->discount) * $i->qty
                        : -(($i->price - $i->discount) * $i->qty))
                , 0)
            );
            return ['date' => $date, 'total' => $total];
        })->sortKeys()->values();

        $totalOmzet   = $omzetPerDay->sum('total');
        $totalSales   = $sales->count();
        $averageOmzet = $totalSales > 0 ? round($totalOmzet / $totalSales) : 0;

        // ── Per-variant statistics in range ───────────────────────────────────
        $itemStats = SaleItem::whereHas('sale', fn($q) =>
                $q->where('status', 'Fixed')->whereBetween('date', [$from, $to])
            )
            ->select(
                'variant_id',
                'type',
                DB::raw('SUM(qty) as total_qty'),
                DB::raw('SUM((price - discount) * qty) as total_revenue')
            )
            ->groupBy('variant_id', 'type')
            ->with('variant.product')
            ->get();

        // Merge Sell and Return rows into one entry per variant
        $variantStats = $itemStats->groupBy('variant_id')->map(function ($rows) {
            $variant = $rows->first()->variant;
            $product = $variant?->product;
            $sell    = $rows->firstWhere('type', 'Sell');
            $return  = $rows->firstWhere('type', 'Return');

            $sellQty   = $sell?->total_qty      ?? 0;
            $returnQty = $return?->total_qty    ?? 0;
            $sellRev   = $sell?->total_revenue  ?? 0;
            $returnRev = $return?->total_revenue ?? 0;

            return [
                'variant_id'  => $variant?->id,
                'code'        => $variant?->code         ?? '—',
                'variant_name'=> $variant?->name         ?? '—',
                'product_name'=> $product?->name         ?? '—',
                'sell_qty'    => $sellQty,
                'return_qty'  => $returnQty,
                'net_qty'     => $sellQty - $returnQty,
                'net_revenue' => $sellRev - $returnRev,
            ];
        })
        ->sortByDesc('net_revenue')
        ->values();

        return Inertia::render('Admin/Report/Index', [
            'from'          => $from,
            'to'            => $to,
            'omzet_per_day' => $omzetPerDay,
            'summary' => [
                'total_omzet'   => $totalOmzet,
                'total_sales'   => $totalSales,
                'average_omzet' => $averageOmzet,
            ],
            'variant_stats' => $variantStats,
        ]);
    }
}
