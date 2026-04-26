<?php

namespace App\Http\Controllers;

use App\Helpers\BarcodeHelper;
use App\Models\Discount;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ProductExport;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Product/Index', [
            // Append a public URL so the frontend can display the image
            'products' => Product::with(['discounts'])->orderBy('name', 'asc')->get()->map(function ($product) {
                $product->image_url = $product->image
                    ? Storage::url($product->image)
                    : null;
                return $product;
            }),
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name'    => 'required',
            'variant' => 'required',
            'code'    => 'nullable|string',
            'normal_price'   => 'required|numeric|min:0',
            'customer_price'   => 'required|numeric|min:0',
            'stock'   => 'required|numeric|min:0',
            'image'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            // Stores to storage/app/public/products/ and symlinked via php artisan storage:link
            $validatedData['image'] = $request->file('image')->store('products', 'public');
        }

        $validatedData['barcode'] = BarcodeHelper::generate();

        Product::create($validatedData);

        return back();
    }

    public function update(Request $request, Product $product)
    {
        $validatedData = $request->validate([
            'name'    => 'required',
            'variant' => 'required',
            'code'    => 'nullable|string',
            'normal_price'   => 'required|numeric|min:0',
            'customer_price'   => 'required|numeric|min:0',
            'stock'   => 'required|numeric|min:0',
            'image'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if it exists
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validatedData['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validatedData);

        return back();
    }

    public function destroy(Product $product)
    {
        // Clean up stored image when product is deleted
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return back();
    }

    public function export(){
        $filename = 'produk_' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new ProductExport, $filename);
    }

    public function store_discount(Request $request, Product $product){
        $validatedData = $request->validate([
            'min_qty' => 'required|numeric|min:0',
            'normal_price' => 'required|numeric|min:0',
            'customer_price' => 'required|numeric|min:0',
        ]);

        $validatedData['product_id'] = $product->id;

        Discount::create($validatedData);

        return back();
    }

    public function update_discount(Request $request, Discount $discount){
        $validatedData = $request->validate([
            'min_qty' => 'required|numeric|min:0',
            'normal_price' => 'required|numeric|min:0',
            'customer_price' => 'required|numeric|min:0',
        ]);

        $discount->update($validatedData);

        return back();
    }

    public function destroy_discount(Discount $discount){
        $discount->delete();

        return back();
    }
}
