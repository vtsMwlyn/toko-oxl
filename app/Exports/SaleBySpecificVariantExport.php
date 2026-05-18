<?php

namespace App\Exports;

use App\Models\SaleItem;
use App\Models\Variant;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SaleBySpecificVariantExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    WithStyles,
    WithTitle,
    WithColumnFormatting,
    ShouldAutoSize
{
    protected Variant $variant;
    protected float $qtyPercent;
    protected ?string $from;
    protected ?string $to;

    public function __construct(Variant $variant, float $qtyPercent = 100, ?string $from = null, ?string $to = null)
    {
        $this->variant    = $variant;
        $this->qtyPercent = $qtyPercent / 100;
        $this->from = $from;
        $this->to = $to;
    }

    // ── Data ──────────────────────────────────────────────────────────────────

    public function collection()
    {
        return SaleItem::with(['sale', 'variant'])
            ->whereHas('sale', fn($q) => $q
                ->where('status', 'Fixed')
                ->when($this->from, fn($q) => $q->whereDate('date', '>=', $this->from))
                ->when($this->to,   fn($q) => $q->whereDate('date', '<=', $this->to))
            )
            ->where('variant_id', $this->variant->id)
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
        return substr($this->variant->product->name, 0, 31);
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
        $adjQty   = (int) floor($item->qty * $this->qtyPercent);                              // ← adjusted
        $subtotal = $item->type === 'Return' ? -($net * $adjQty) : $net * $adjQty;

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
            $adjQty,        // ← adjusted
            $subtotal,      // ← recalculated
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
