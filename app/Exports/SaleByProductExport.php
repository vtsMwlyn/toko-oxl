<?php

namespace App\Exports;

use App\Models\SaleItem;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class SaleByProductExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    WithStyles,
    WithColumnWidths,
    WithTitle
{
    protected float $qtyPercent;

    public function __construct(float $qtyPercent = 100)
    {
        $this->qtyPercent = $qtyPercent / 100;
    }

    public function title(): string
    {
        return 'Penjualan per Produk';
    }

    public function collection()
    {
        return SaleItem::with(['variant.product', 'sale'])
            ->where('type', 'Sell')
            ->whereHas('sale', fn($q) => $q->where('status', 'Fixed'))
            ->get()
            ->sortBy([
                fn($a, $b) => strcmp(
                    $a->variant->product->name ?? '',
                    $b->variant->product->name ?? ''
                ),
                fn($a, $b) => strcmp($a->sale->date, $b->sale->date),
            ]);
    }

    public function headings(): array
    {
        return ['Nama Produk', 'Varian', 'Tanggal', 'Pelanggan', 'Qty', 'Harga'];
    }

    public function map($item): array
    {
        return [[
            $item->variant->product->name ?? '—',
            $item->variant->name          ?? '—',
            $item->sale->date,
            $item->sale->customer_name    ?? '',
            (int) floor($item->qty * $this->qtyPercent),   // ← adjusted
            $item->price,
        ]];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 28,  // Nama Produk
            'B' => 18,  // Varian
            'C' => 14,  // Tanggal
            'D' => 24,  // Pelanggan
            'E' => 8,   // Qty
            'F' => 18,  // Harga
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return $this->applyStyles($sheet, 'A1:F');
    }

    // Shared styling helper
    public static function applyStyles(Worksheet $sheet, string $range): array
    {
        $lastRow = $sheet->getHighestRow();
        $cols    = substr($range, 0, strpos($range, '1:') + 1) . $lastRow;
        $header  = substr($range, 0, strpos($range, ':')) . '1:' . substr($range, strpos($range, ':') + 1) . '1';

        $sheet->getStyle($header)->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11, 'name' => 'Arial'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '059669']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1FAE5']]],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(20);

        if ($lastRow >= 2) {
            for ($row = 2; $row <= $lastRow; $row++) {
                $fill = ($row % 2 === 0) ? 'F0FDF4' : 'FFFFFF';
                $rowRange = substr($range, 0, strpos($range, ':')) . $row . ':' . substr($range, strpos($range, ':') + 1) . $row;
                $sheet->getStyle($rowRange)->applyFromArray([
                    'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $fill]],
                    'font'    => ['name' => 'Arial', 'size' => 10],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_HAIR, 'color' => ['rgb' => 'D1D5DB']]],
                ]);
            }

            $lastCol = substr($range, strpos($range, ':') + 1);
            $priceCol = $lastCol; // Last column is always price
            $sheet->getStyle("{$priceCol}2:{$priceCol}{$lastRow}")
                ->getNumberFormat()->setFormatCode('"Rp "#,##0');

            $qtyCol = chr(ord($lastCol) - 1); // Second to last is qty
            $sheet->getStyle("{$qtyCol}2:{$qtyCol}{$lastRow}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        }

        $sheet->getStyle($cols)->applyFromArray([
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '059669']]],
        ]);

        $sheet->freezePane('A2');

        return [];
    }
}
