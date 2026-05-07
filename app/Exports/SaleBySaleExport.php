<?php

namespace App\Exports;

use App\Models\Sale;
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

class SaleBySaleExport implements
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
        return 'Penjualan per Transaksi';
    }

    public function collection()
    {
        return Sale::with(['items.variant.product'])
            ->where('status', 'Fixed')
            ->orderByDesc('date')
            ->orderByDesc('time')
            ->get()
            ->flatMap(function ($sale) {
                return $sale->items->where('type', 'Sell')->map(fn($item) => [
                    'sale'    => $sale,
                    'item'    => $item,
                ]);
            });
    }

    public function headings(): array
    {
        return ['Tanggal', 'Waktu', 'Pelanggan', 'Nama Produk', 'Varian', 'Qty', 'Harga'];
    }

    public function map($row): array
    {
        return [[
            $row['sale']->date,
            $row['sale']->time,
            $row['sale']->customer_name          ?? '',
            $row['item']->variant->product->name ?? '—',
            $row['item']->variant->name          ?? '—',
            (int) floor($row['item']->qty * $this->qtyPercent),
            $row['item']->price,
        ]];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 14,  // Tanggal
            'B' => 10,  // Waktu
            'C' => 24,  // Pelanggan
            'D' => 28,  // Nama Produk
            'E' => 18,  // Varian
            'F' => 8,   // Qty
            'G' => 18,  // Harga
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        $lastRow = $sheet->getHighestRow();

        $sheet->getStyle('A1:G1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11, 'name' => 'Arial'],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '059669']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1FAE5']]],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(20);

        if ($lastRow >= 2) {
            for ($row = 2; $row <= $lastRow; $row++) {
                $fill = ($row % 2 === 0) ? 'F0FDF4' : 'FFFFFF';
                $sheet->getStyle("A{$row}:G{$row}")->applyFromArray([
                    'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $fill]],
                    'font'    => ['name' => 'Arial', 'size' => 10],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_HAIR, 'color' => ['rgb' => 'D1D5DB']]],
                ]);
            }

            $sheet->getStyle("G2:G{$lastRow}")
                ->getNumberFormat()->setFormatCode('"Rp "#,##0');

            $sheet->getStyle("F2:F{$lastRow}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        }

        $sheet->getStyle("A1:G{$lastRow}")->applyFromArray([
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '059669']]],
        ]);

        $sheet->freezePane('A2');

        return [];
    }
}
