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

class SaleByProductExport implements
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
        return 'Penjualan per Produk';
    }

    public function collection()
    {
        return SaleItem::with(['variant.product', 'sale'])
            ->whereHas('sale', fn($q) => $q
                ->where('status', 'Fixed')
                ->when($this->from, fn($q) => $q->whereDate('date', '>=', $this->from))
                ->when($this->to,   fn($q) => $q->whereDate('date', '<=', $this->to))
            )
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
        return ['Nama Produk', 'Varian', 'Tipe Item', 'Tanggal', 'Pelanggan', 'Tipe Transaksi', 'Qty', 'Harga'];
    }

    public function map($item): array
    {
        return [[
            $item->variant->product->name ?? '—',
            $item->variant->name          ?? '—',
            $item->type,
            $item->sale->date,
            $item->sale->customer_name    ?? '',
            $item->sale->type,
            (int) ceil($item->qty * $this->qtyPercent),
            $item->price,
        ]];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 28,  // Nama Produk
            'B' => 18,  // Varian
            'C' => 10,  // Tipe Item
            'D' => 14,  // Tanggal
            'E' => 24,  // Pelanggan
            'F' => 14,  // Tipe Transaksi
            'G' => 8,   // Qty
            'H' => 18,  // Harga
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        $lastRow = $sheet->getHighestRow();

        $sheet->getStyle('A1:H1')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11, 'name' => 'Arial'],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '059669']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1FAE5']]],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(20);

        if ($lastRow >= 2) {
            for ($row = 2; $row <= $lastRow; $row++) {
                $fill = ($row % 2 === 0) ? 'F0FDF4' : 'FFFFFF';
                $sheet->getStyle("A{$row}:H{$row}")->applyFromArray([
                    'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $fill]],
                    'font'    => ['name' => 'Arial', 'size' => 10],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_HAIR, 'color' => ['rgb' => 'D1D5DB']]],
                ]);
            }

            $sheet->getStyle("H2:H{$lastRow}")
                ->getNumberFormat()->setFormatCode('"Rp "#,##0');

            $sheet->getStyle("G2:G{$lastRow}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $sheet->getStyle("C2:C{$lastRow}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $sheet->getStyle("F2:F{$lastRow}")
                ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        }

        $sheet->getStyle("A1:H{$lastRow}")->applyFromArray([
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '059669']]],
        ]);

        $sheet->freezePane('A2');

        return [];
    }
}
