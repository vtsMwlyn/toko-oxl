<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Allow HeadCashier to delete sales for now
        if (Auth::user()->role == 'Admin' || (Auth::user()->role == 'HeadCashier' && $request->routeIs('admin.sale.destroy*'))) {
            return $next($request);
        }

        abort(403);
    }
}
