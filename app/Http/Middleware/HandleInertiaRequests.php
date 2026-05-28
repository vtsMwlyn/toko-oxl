<?php

namespace App\Http\Middleware;

use App\Models\Variant;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'queue_number' => fn () => $request->session()->get('queue_number'),
                'success'      => fn () => $request->session()->get('success'),
            ],
            'low_stock_variants' => fn () => $request->user()
                ? Variant::where('low_stock_warning', '>', 0)
                    ->whereColumn('stock', '<=', 'low_stock_warning')
                    ->with('product')
                    ->get()
                : [],
        ];
    }
}
