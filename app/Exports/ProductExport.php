<?php

namespace App\Exports;

use App\Models\Product;
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

class ProductExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    WithStyles,
    WithColumnWidths,
    WithTitle
{
    public function title(): string
    {
        return 'Daftar Produk';
    }

    public function collection()
    {
        return Product::orderBy('name')->get();
    }

    public function headings(): array
    {
        return ['Kode', 'Barcode', 'Nama', 'Varian', 'Stok', 'Harga Normal'];
    }

    public function map($product): array
    {
        return [[
            $product->code,
            (string) ($product->barcode ?? '—'),
            $product->name,
            $product->variant   ?? '—',
            $product->stock,
            $product->normal_price,
        ]];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 16,  // Kode
            'B' => 20,  // Barcode
            'C' => 28,  // Nama
            'D' => 18,  // Varian
            'E' => 10,  // Stok
            'F' => 18,  // Harga Normal
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        $lastRow = $sheet->getHighestRow();

        // ── Header ────────────────────────────────────────────────────────────
        $sheet->getStyle('A1:F1')->applyFromArray([
            'font' => [
                'bold'  => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size'  => 11,
                'name'  => 'Arial',
            ],
            'fill' => [
                'fillType'   => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '059669'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color'       => ['rgb' => 'D1FAE5'],
                ],
            ],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(20);

        // ── Data rows ─────────────────────────────────────────────────────────
        if ($lastRow >= 2) {
            for ($row = 2; $row <= $lastRow; $row++) {
                $fill = ($row % 2 === 0) ? 'F0FDF4' : 'FFFFFF';
                $sheet->getStyle("A{$row}:F{$row}")->applyFromArray([
                    'fill' => [
                        'fillType'   => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => $fill],
                    ],
                    'font'    => ['name' => 'Arial', 'size' => 10],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_HAIR,
                            'color'       => ['rgb' => 'D1D5DB'],
                        ],
                    ],
                ]);
            }

            // Price format: Rp #,##0
            $sheet->getStyle("F2:F{$lastRow}")
                ->getNumberFormat()->setFormatCode('"Rp "#,##0');

            // Barcode column as text to prevent scientific notation
            $sheet->getStyle("B2:B{$lastRow}")
                ->getNumberFormat()->setFormatCode(NumberFormat::FORMAT_TEXT);

            // Center stock column
            $sheet->getStyle("E2:E{$lastRow}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        }

        // ── Outer border ──────────────────────────────────────────────────────
        $sheet->getStyle("A1:F{$lastRow}")->applyFromArray([
            'borders' => [
                'outline' => [
                    'borderStyle' => Border::BORDER_MEDIUM,
                    'color'       => ['rgb' => '059669'],
                ],
            ],
        ]);

        $sheet->freezePane('A2');

        return [];
    }
}
