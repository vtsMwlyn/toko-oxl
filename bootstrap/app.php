<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\IsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (\Illuminate\Database\QueryException $e, \Illuminate\Http\Request $request) {
            // Error 23000: Integrity constraint violation (e.g., foreign key constraint or duplicate entry)
            if ($e->getCode() == 23000) {
                return back()->with('error', 'Operasi gagal: Data tidak dapat dihapus/diubah karena sedang digunakan oleh data lain, atau data sudah ada.');
            }
        });
    })->create();
