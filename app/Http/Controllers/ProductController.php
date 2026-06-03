<?php

namespace App\Http\Controllers;

use App\Exports\ProductExport;
use App\Helpers\BarcodeHelper;
use App\Models\ActionLog;
use App\Models\Discount;
use App\Models\Product;
use App\Models\Variant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Helpers\ModelChangeLogger;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        return Inertia::render('Admin/Product/Index', [
            'search'   => $search,
            'products' => Product::with(['variants' => fn ($q) => $q->orderBy('name', 'asc'), 'discounts'])
                ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhereHas('variants', fn ($vq) => $vq
                          ->where('name', 'like', "%{$search}%")
                          ->orWhere('code', 'like', "%{$search}%")
                      );
                }))
                ->orderBy('name', 'asc')
                ->paginate(20)
                ->through(function ($product) {
                    $product->variants->each(function ($variant) {
                        $variant->image_url = $variant->image
                            ? (app()->isLocal()
                                ? Storage::url($variant->image)
                                : Storage::url('/app/public/' . $variant->image))
                            : null;
                    });
                    return $product;
                }),
            'low_stock_variants' => Variant::whereColumn('stock', '<=', 'low_stock_warning')->with('product')->get(),
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

        return back()->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(Request $request, Product $product)
    {
        $validatedData = $request->validate([
            'name'    => 'required',
            'normal_price'   => 'required|numeric|min:0',
            'customer_price'   => 'required|numeric|min:0',
        ]);

        $changes = ModelChangeLogger::getChanges($product, $validatedData);

        $product->update($validatedData);

        if (!empty($changes)) {
            ActionLog::create([
                'user_id' => Auth::id(),
                'message' => 'Memperbaharui data ' . $product->name,
                'changes' => $changes,
            ]);
        }

        return back()->with('success', 'Produk berhasil diperbarui.');
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

        return back()->with('success', 'Produk berhasil dihapus.');
    }


    // Variant
    public function store_variant(Request $request, Product $product)
    {
        $validatedData = $request->validate([
            'name'                => 'required',
            'code'                => 'nullable|string',
            'stock'               => 'required|numeric|min:0',
            'image'               => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'low_stock_warning'   => 'required|numeric|min:0',
        ]);

        if ($request->hasFile('image')) {
            // Stores to storage/app/public/products/ and symlinked via php artisan storage:link
            $validatedData['image'] = $request->file('image')->store('products', 'public');
        }

        $validatedData['barcode'] = BarcodeHelper::generate();
        $validatedData['product_id'] = $product->id;

        Variant::create($validatedData);

        return back()->with('success', 'Varian berhasil ditambahkan.');
    }

    public function update_variant(Request $request, Variant $variant)
    {
        $validatedData = $request->validate([
            'name'                => 'required',
            'code'                => 'nullable|string',
            'stock'               => 'required|numeric|min:0',
            'image'               => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'low_stock_warning'   => 'required|numeric|min:0',
        ]);

        if ($request->hasFile('image')) {
            if ($variant->image) {
                Storage::disk('public')->delete($variant->image);
            }
            $validatedData['image'] = $request->file('image')->store('products', 'public');
        }

        $changes = ModelChangeLogger::getChanges($variant, $validatedData, [
            'special' => [
                'image' => 'updated',
            ],
        ]);

        $variant->update($validatedData);

        if (!empty($changes)) {
            ActionLog::create([
                'user_id' => Auth::id(),
                'message' => 'Memperbaharui data '
                    . $variant->product->name . ' '
                    . $variant->name . ' (' . $variant->code . ')',
                'changes' => $changes,
            ]);
        }

        return back()->with('success', 'Varian berhasil diperbarui.');
    }

    public function destroy_variant(Variant $variant)
    {
        // Clean up stored image when product is deleted
        if ($variant->image) {
            Storage::disk('public')->delete($variant->image);
        }

        $variant->delete();

        return back()->with('success', 'Varian berhasil dihapus.');
    }

    public function add_stock(Request $request, Variant $variant)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
        ]);

        $variant->increment('stock', $request->amount);

        ActionLog::create([
            'user_id' => Auth::id(),
            'message' => 'Menambahkan stok ' . $variant->product->name . ' ' . $variant->name . ' (' . $variant->code . ') sebanyak ' . $request->amount . ' buah.',
        ]);

        return back()->with('success', 'Stok berhasil ditambahkan.');
    }

    public function reduce_stock(Request $request, Variant $variant)
    {
        $request->validate([
            'amount' => [
                'required',
                'integer',
                'min:1',
                'max:' . $variant->stock
            ],
        ], [
            'amount.max' => "Jumlah pengurangan tidak boleh melebihi sisa stok saat ini ({$variant->stock})."
        ]);

        $variant->decrement('stock', $request->amount);

        ActionLog::create([
            'user_id' => Auth::id(),
            'message' => 'Mengurangi stok ' . $variant->product->name . ' ' . $variant->name . ' (' . $variant->code . ') sebanyak ' . $request->amount . ' buah.',
        ]);

        return back()->with('success', 'Stok berhasil dikurangi.');
    }

    public function set_stock_warning(Request $request, Variant $variant)
    {
        $request->validate([
            'threshold' => 'required|integer|min:0',
        ]);

        $variant->update(['low_stock_warning' => $request->threshold]);

        return back()->with('success', 'Batas stok rendah berhasil diatur.');
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

        return back()->with('success', 'Harga spesial berhasil ditambahkan.');
    }

    public function update_discount(Request $request, Discount $discount){
        $validatedData = $request->validate([
            'min_qty' => 'required|numeric|min:0',
            'normal_price' => 'required|numeric|min:0',
            'customer_price' => 'required|numeric|min:0',
        ]);

        $discount->update($validatedData);

        return back()->with('success', 'Harga spesial berhasil diperbarui.');
    }

    public function destroy_discount(Discount $discount){
        $discount->delete();

        return back()->with('success', 'Harga spesial berhasil dihapus.');
    }
}
