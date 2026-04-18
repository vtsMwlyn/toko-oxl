<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today     = today();
        $thisMonth = now()->startOfMonth();

        // ── Summary cards ─────────────────────────────────────────────────────
        $totalProducts = Product::count();
        $totalUsers    = User::count();

        $salesToday = Sale::where('status', 'fixed')
            ->whereDate('date', $today)
            ->with('items')
            ->get();

        $omzetToday = $salesToday->sum(fn($sale) =>
            $sale->items->reduce(fn($c, $i) =>
                $c + ($i->type === 'Sell' ? ($i->price - $i->discount) * $i->qty
                                          : -(($i->price - $i->discount) * $i->qty))
            , 0)
        );

        $omzetThisMonth = Sale::where('status', 'fixed')
            ->where('date', '>=', $thisMonth)
            ->with('items')
            ->get()
            ->sum(fn($sale) =>
                $sale->items->reduce(fn($c, $i) =>
                    $c + ($i->type === 'Sell' ? ($i->price - $i->discount) * $i->qty
                                              : -(($i->price - $i->discount) * $i->qty))
                , 0)
            );

        // ── Last 7 days omzet (for sparkline/bar chart) ───────────────────────
        $last7Days = collect(range(6, 0))->map(fn($d) => today()->subDays($d)->toDateString());

        $salesLast7 = Sale::where('status', 'fixed')
            ->whereBetween('date', [$last7Days->first(), $last7Days->last()])
            ->with('items')
            ->get()
            ->groupBy('date');

        $omzetPerDay = $last7Days->map(fn($date) => [
            'date'  => $date,
            'label' => \Carbon\Carbon::parse($date)->isoFormat('D MMM'),
            'total' => ($salesLast7->get($date) ?? collect())->sum(fn($sale) =>
                $sale->items->reduce(fn($c, $i) =>
                    $c + ($i->type === 'Sell' ? ($i->price - $i->discount) * $i->qty
                                              : -(($i->price - $i->discount) * $i->qty))
                , 0)
            ),
        ])->values();

        // ── Recent fixed sales ────────────────────────────────────────────────
        $recentSales = Sale::where('status', 'fixed')
            ->orderByDesc('date')->orderByDesc('time')
            ->limit(5)
            ->with('items')
            ->get()
            ->map(fn($sale) => [
                'id'            => $sale->id,
                'date'          => $sale->date,
                'time'          => $sale->time,
                'customer_name' => $sale->customer_name,
                'total'         => $sale->items->reduce(fn($c, $i) =>
                    $c + ($i->type === 'Sell' ? ($i->price - $i->discount) * $i->qty
                                              : -(($i->price - $i->discount) * $i->qty))
                , 0),
            ]);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_products'   => $totalProducts,
                'total_users'      => $totalUsers,
                'omzet_today'      => $omzetToday,
                'omzet_this_month' => $omzetThisMonth,
                'sales_today'      => $salesToday->count(),
            ],
            'omzet_per_day' => $omzetPerDay,
            'recent_sales'  => $recentSales,
        ]);
    }
}
