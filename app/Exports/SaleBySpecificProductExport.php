<?php

namespace App\Exports;

use App\Models\Product;
use App\Models\SaleItem;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SaleBySpecificProductExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    WithStyles,
    WithTitle,
    WithColumnFormatting,
    ShouldAutoSize
{
    protected Product $product;
    protected float $qtyPercent;
    protected ?string $from;
    protected ?string $to;

    public function __construct(Product $product, float $qtyPercent = 100, ?string $from = null, ?string $to = null)
    {
        $this->product    = $product;
        $this->qtyPercent = $qtyPercent / 100;
        $this->from       = $from;
        $this->to         = $to;
    }

    // ── Data ──────────────────────────────────────────────────────────────────

    public function collection()
    {
        $variantIds = $this->product->variants->pluck('id');

        return SaleItem::with(['sale', 'variant'])
            ->whereIn('variant_id', $variantIds)
            ->whereHas('sale', fn($q) => $q
                ->where('status', 'Fixed')
                ->when($this->from, fn($q) => $q->whereDate('date', '>=', $this->from))
                ->when($this->to,   fn($q) => $q->whereDate('date', '<=', $this->to))
            )
            ->orderByDesc(
                \App\Models\Sale::select('date')
                    ->whereColumn('sales.id', 'sale_items.sale_id')
                    ->limit(1)
            )
            ->get();
    }

    // ── Sheet title ───────────────────────────────────────────────────────────

    public function title(): string
    {
        return substr($this->product->name, 0, 31);
    }

    // ── Column headings ───────────────────────────────────────────────────────

    public function headings(): array
    {
        return [
            'Date',
            'Time',
            'Customer',
            'Sale ID',
            'Product',
            'Variant',
            'Type',
            'Price',
            'Discount',
            'Qty',
            'Subtotal',
        ];
    }

    // ── Row mapping ───────────────────────────────────────────────────────────

    public function map($item): array
    {
        $net      = $item->price - ($item->discount ?? 0);
        $adjQty   = (int) ceil($item->qty * $this->qtyPercent);
        $subtotal = $item->type === 'Return' ? -($net * $adjQty) : $net * $adjQty;

        return [
            $item->sale->date,
            $item->sale->time,
            $item->sale->customer_name    ?? '—',
            $item->sale_id,
            $item->variant->product->name ?? '—',
            $item->variant->name          ?? '—',
            $item->type,
            $item->price,
            $item->discount               ?? 0,
            $adjQty,
            $subtotal,
        ];
    }

    // ── Currency columns ──────────────────────────────────────────────────────

    public function columnFormats(): array
    {
        return [
            'H' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1, // Price
            'I' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1, // Discount
            'K' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1, // Subtotal
        ];
    }

    // ── Styles ────────────────────────────────────────────────────────────────

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
