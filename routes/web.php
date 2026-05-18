<?php

use App\Http\Controllers\CashierController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReturnController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Home and dashboard
Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::middleware(['auth'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Both Admin and Cashier Can Do
    Route::get('/sale', [SaleController::class, 'index'])   ->name('sale.index');
    Route::post('/sale/{sale}', [SaleController::class, 'update'])  ->name('sale.update');
    Route::post('/sale/{sale}/set-fixed', [SaleController::class, 'set_fixed'])  ->name('sale.set-fixed');

    // ==== ADMIN ==== //
    Route::prefix('/admin')->middleware('admin')->name('admin.')->group(function(){
        // Product
        Route::prefix('/product')->name('product.')->group(function(){
            Route::get('/', [ProductController::class, 'index'])->name('index');
            Route::post('/store', [ProductController::class, 'store'])->name('store');
            Route::post('/{product}/edit', [ProductController::class, 'update'])->name('update');
            Route::delete('/{product}/delete', [ProductController::class, 'destroy'])->name('destroy');

            // Variant
            Route::prefix('/variant')->name('variant.')->group(function(){
                Route::post('/{product}/store', [ProductController::class, 'store_variant'])->name('store');
                Route::post('/{variant}/edit', [ProductController::class, 'update_variant'])->name('update');
                Route::delete('/{variant}/delete', [ProductController::class, 'destroy_variant'])->name('destroy');

                Route::post('/{variant}/add-stock', [ProductController::class, 'add_stock'])->name('add-stock');
                Route::post('/{variant}/reduce-stock', [ProductController::class, 'reduce_stock'])->name('reduce-stock');
                Route::post('/{variant}/stock-warning', [ProductController::class, 'set_stock_warning'])->name('stock_warning');
            });

            // Discount
            Route::prefix('/discount')->name('discount.')->group(function(){
                Route::post('/{product}/store', [ProductController::class, 'store_discount'])->name('store');
                Route::post('/{discount}/edit', [ProductController::class, 'update_discount'])->name('update');
                Route::delete('/{discount}/delete', [ProductController::class, 'destroy_discount'])->name('destroy');
            });
        });

        // Customer
        Route::prefix('/customer')->name('customer.')->group(function(){
            Route::get('', [CustomerController::class, 'index'])->name('index');
            Route::post('', [CustomerController::class, 'store'])->name('store');
            Route::get('/{customer}', [CustomerController::class, 'show'])->name('show');
            Route::post('/{customer}', [CustomerController::class, 'update'])->name('update');
            Route::delete('/{customer}',[CustomerController::class, 'destroy'])->name('destroy');
        });

        // Sale
        Route::prefix('/sale')->name('sale.')->group(function(){
            Route::post('/', [SaleController::class, 'store'])->name('store');
            Route::delete('/{sale}', [SaleController::class, 'destroy'])->name('destroy');
            Route::delete('/', [SaleController::class, 'destroyBatch'])->name('destroyBatch');

            Route::get('/export/by-product',                  [SaleController::class, 'exportByProduct'])->name('export.byProduct');
            Route::get('/export/by-sale',                     [SaleController::class, 'exportBySale'])->name('export.bySale');
            Route::get('/export/by-variant/{variant}',        [SaleController::class, 'exportBySpecificProduct'])->name('export.byVariant');
            Route::get('/export/by-product-group/{product}',  [SaleController::class, 'exportBySpecificProductGroup'])->name('export.byProductGroup');
        });

        Route::prefix('returns')->name('return.')->group(function () {
            Route::get('/',              [ReturnController::class, 'index'])->name('index');
            Route::post('/',             [ReturnController::class, 'store'])->name('store');
            Route::put('/{return}',      [ReturnController::class, 'update'])->name('update');
            Route::delete('/{return}',   [ReturnController::class, 'destroy'])->name('destroy');
        });

        // Report
        Route::get('/report', [ReportController::class, 'index'])->name('report.index');

        // Action Log
        Route::get('/log', [LogController::class, 'index'])->name('log.index');

        // User
        Route::prefix('/user')->name('user.')->group(function(){
            Route::get('/', [UserController::class, 'index'])   ->name('index');
            Route::post('/', [UserController::class, 'store'])   ->name('store');
            Route::post('/{user}', [UserController::class, 'update'])  ->name('update');
            Route::delete('/{user}', [UserController::class, 'destroy']) ->name('destroy');
        });
    });

    // ==== CASHIER ==== //
    Route::prefix('cashier')->name('cashier.')->group(function () {
        Route::get('/',    [CashierController::class, 'index'])->name('index');
        Route::post('/',   [CashierController::class, 'store'])->name('sale.store');
    });
});

require __DIR__.'/auth.php';
