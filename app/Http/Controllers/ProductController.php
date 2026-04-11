<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(){
        return Inertia::render('Admin/Product/Index', [
            'products' => Product::all(),
        ]);
    }

    public function store(Request $request){
        $validatedData = $request->validate([
            'name' => 'required',
            'variant' => 'required',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|numeric|min:0',
        ]);

        Product::create($validatedData);

        return back();
    }

    public function update(Request $request, Product $product){
        $validatedData = $request->validate([
            'name' => 'required',
            'variant' => 'required',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|numeric|min:0',
        ]);

        $product->update($validatedData);

        return back();
    }

    public function destroy(Product $product){
        $product->delete();

        return back();
    }
}
