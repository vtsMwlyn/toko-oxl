<?php

namespace App\Http\Controllers;

use App\Exports\ProductExport;
use App\Helpers\BarcodeHelper;
use App\Models\Discount;
use App\Models\Product;
use App\Models\Variant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Product/Index', [
            'products' => Product::with(['variants', 'discounts'])->orderBy('name', 'asc')->get()->map(function ($product) {
                $product->variants->each(function ($variant) {
                    $variant->image_url = $variant->image
                        ? Storage::url($variant->image)
                        : null;
                });
                return $product;
            }),
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name'    => 'required',
            'normal_price'   => 'required|numeric|min:0',
            'customer_price'   => 'required|numeric|min:0',
        ]);

        Product::create($validatedData);

        return back();
    }

    public function update(Request $request, Product $product)
    {
        $validatedData = $request->validate([
            'name'    => 'required',
            'normal_price'   => 'required|numeric|min:0',
            'customer_price'   => 'required|numeric|min:0',
        ]);

        $product->update($validatedData);

        return back();
    }

    public function destroy(Product $product)
    {
        // Clean up stored image when product is deleted
        foreach($product->variants as $variant){
            if ($variant->image) {
                Storage::disk('public')->delete($variant->image);
            }
        }

        $product->delete();

        return back();
    }

    public function export(){
        $filename = 'produk_' . now()->format('Ymd_His') . '.xlsx';

        return Excel::download(new ProductExport, $filename);
    }


    // Variant
    public function store_variant(Request $request, Product $product)
    {
        $validatedData = $request->validate([
            'name'    => 'required',
            'code'    => 'nullable|string',
            'stock'   => 'required|numeric|min:0',
            'image'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            // Stores to storage/app/public/products/ and symlinked via php artisan storage:link
            $validatedData['image'] = $request->file('image')->store('products', 'public');
        }

        $validatedData['barcode'] = BarcodeHelper::generate();
        $validatedData['product_id'] = $product->id;

        Variant::create($validatedData);

        return back();
    }

    public function update_variant(Request $request, Variant $variant)
    {
        $validatedData = $request->validate([
            'name'    => 'required',
            'code'    => 'nullable|string',
            'stock'   => 'required|numeric|min:0',
            'image'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if it exists
            if ($variant->image) {
                Storage::disk('public')->delete($variant->image);
            }
            $validatedData['image'] = $request->file('image')->store('products', 'public');
        }

        $variant->update($validatedData);

        return back();
    }

    public function destroy_variant(Variant $variant)
    {
        // Clean up stored image when product is deleted
        if ($variant->image) {
            Storage::disk('public')->delete($variant->image);
        }

        $variant->delete();

        return back();
    }


    // Special Price (Discount)
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
