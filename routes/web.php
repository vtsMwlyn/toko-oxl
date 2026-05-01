<?php

use App\Http\Controllers\CashierController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth'])->group(function () {
    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

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
            Route::get('/', [SaleController::class, 'index'])   ->name('index');
            Route::post('/', [SaleController::class, 'store'])   ->name('store');
            Route::post('/{sale}', [SaleController::class, 'update'])  ->name('update');
            Route::delete('/{sale}', [SaleController::class, 'destroy']) ->name('destroy');

            Route::get('/sales/export/product', [SaleController::class, 'exportByProduct'])->name('export.product');
            Route::get('/sales/export/sale',    [SaleController::class, 'exportBySale'])->name('export.sale');
        });

        // Report
        Route::get('/report', [ReportController::class, 'index'])->name('report.index');

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
        Route::get('/barcode-scanner-test',    [CashierController::class, 'barcode_scanner_test'])->name('barcode-scanner-test');
    });
});

require __DIR__.'/auth.php';
