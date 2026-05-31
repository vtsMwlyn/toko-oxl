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
    protected ?string $from;
    protected ?string $to;

    public function __construct(float $qtyPercent = 100, ?string $from = null, ?string $to = null)
    {
        $this->qtyPercent = $qtyPercent / 100;
        $this->from       = $from;
        $this->to         = $to;
    }

    public function title(): string
    {
        return 'Penjualan per Transaksi';
    }

    public function collection()
    {
        return Sale::with(['items.variant.product'])
            ->where('status', 'Fixed')
            ->when($this->from, fn($q) => $q->whereDate('date', '>=', $this->from))
            ->when($this->to,   fn($q) => $q->whereDate('date', '<=', $this->to))
            ->orderByDesc('date')
            ->orderByDesc('time')
            ->get()
            ->flatMap(function ($sale) {
                // All items — Sell and Return
                return $sale->items->map(fn($item) => [
                    'sale' => $sale,
                    'item' => $item,
                ]);
            });
    }

    public function headings(): array
    {
        return ['Tanggal', 'Waktu', 'Tipe Transaksi', 'Pelanggan', 'Nama Produk', 'Varian', 'Tipe Item', 'Qty', 'Harga'];
    }

    public function map($row): array
    {
        return [[
            $row['sale']->date,
            $row['sale']->time,
            $row['sale']->type,
            $row['sale']->customer_name          ?? '',
            $row['item']->variant->product->name ?? '—',
            $row['item']->variant->name          ?? '—',
            $row['item']->type,
            (int) ceil($row['item']->qty * $this->qtyPercent),
            $row['item']->price,
        ]];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 14,  // Tanggal
            'B' => 10,  // Waktu
            'C' => 14,  // Tipe Transaksi
            'D' => 24,  // Pelanggan
            'E' => 28,  // Nama Produk
            'F' => 18,  // Varian
            'G' => 10,  // Tipe Item
            'H' => 8,   // Qty
            'I' => 18,  // Harga
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        $lastRow = $sheet->getHighestRow();

        $sheet->getStyle('A1:I1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11, 'name' => 'Arial'],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '059669']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1FAE5']]],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(20);

        if ($lastRow >= 2) {
            for ($row = 2; $row <= $lastRow; $row++) {
                $fill = ($row % 2 === 0) ? 'F0FDF4' : 'FFFFFF';
                $sheet->getStyle("A{$row}:I{$row}")->applyFromArray([
                    'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $fill]],
                    'font'    => ['name' => 'Arial', 'size' => 10],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_HAIR, 'color' => ['rgb' => 'D1D5DB']]],
                ]);
            }

            $sheet->getStyle("I2:I{$lastRow}")
                ->getNumberFormat()->setFormatCode('"Rp "#,##0');

            $sheet->getStyle("H2:H{$lastRow}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $sheet->getStyle("C2:C{$lastRow}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $sheet->getStyle("G2:G{$lastRow}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        }

        $sheet->getStyle("A1:I{$lastRow}")->applyFromArray([
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '059669']]],
        ]);

        $sheet->freezePane('A2');

        return [];
    }
}
