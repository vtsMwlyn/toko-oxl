<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth'])->group(function () {
    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::prefix('/admin')->middleware('admin')->name('admin.')->group(function(){
        // Product
        Route::prefix('/product')->name('product.')->group(function(){
            Route::get('/', [ProductController::class, 'index'])->name('index');
            Route::post('/store', [ProductController::class, 'store'])->name('store');
            Route::post('/{product}/edit', [ProductController::class, 'update'])->name('update');
            Route::delete('/{product}/delete', [ProductController::class, 'destroy'])->name('destroy');

            // Discount
            Route::prefix('/discount')->name('discount.')->group(function(){
                Route::post('/{product}/store', [ProductController::class, 'store_discount'])->name('store');
                Route::post('/{discount}/edit', [ProductController::class, 'update_discount'])->name('update');
                Route::delete('/{discount}/delete', [ProductController::class, 'destroy_discount'])->name('destroy');
            });
        });

        Route::prefix('/user')->name('user.')->group(function(){
            Route::get('/', [UserController::class, 'index'])   ->name('index');
            Route::post('/', [UserController::class, 'store'])   ->name('store');
            Route::post('/{user}', [UserController::class, 'update'])  ->name('update');
            Route::delete('/{user}', [UserController::class, 'destroy']) ->name('destroy');
        });
    });

});

require __DIR__.'/auth.php';
