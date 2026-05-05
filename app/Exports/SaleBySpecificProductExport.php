<?php

namespace App\Exports;

use App\Models\Product;
use App\Models\SaleItem;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;

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

    public function __construct(Product $product)
    {
        $this->product = $product;
    }

    // ── Data ──────────────────────────────────────────────────────────────────

    public function collection()
    {
        return SaleItem::with(['sale', 'variant'])
            ->whereHas('sale', fn($q) => $q->where('status', 'Fixed'))
            ->whereHas('variant', fn($q) => $q->where('product_id', $this->product->id))
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
        // Sheet names are limited to 31 chars in Excel
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
        $subtotal = $item->type === 'Return' ? -($net * $item->qty) : $net * $item->qty;

        return [
            $item->sale->date,
            $item->sale->time,
            $item->sale->customer_name ?? '—',
            $item->sale_id,
            $item->variant->product->name ?? '—',
            $item->variant->name ?? '—',
            $item->type,
            $item->price,
            $item->discount ?? 0,
            $item->qty,
            $subtotal,
        ];
    }

    // ── Currency columns ──────────────────────────────────────────────────────

    public function columnFormats(): array
    {
        return [
            'G' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1, // Price
            'H' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1, // Discount
            'J' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1, // Subtotal
        ];
    }

    // ── Styles ────────────────────────────────────────────────────────────────

    public function styles(Worksheet $sheet): array
    {
        // Bold header row
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
