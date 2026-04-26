import { Printer } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';

import formatPrice from '@/Helpers/formatPrice';

export default function PrintAllBarcode({ products, formatPrice }) {
    function handlePrint() {
        const win = window.open('', '_blank', 'width=900,height=700');

        // Build one <svg> placeholder per product — JsBarcode will fill them
        const labels = products.map((p, i) => `
            <div class="label">
                <svg class="barcode" id="bc-${i}" data-barcode="${p.barcode}"></svg>
                <p class="name">${p.name}${p.variant ? ` — ${p.variant}` : ''}</p>
                <p class="price">${formatPrice(p.normal_price ?? 0)}</p>
            </div>
        `).join('');

        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Cetak Barcode Produk</title>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js"><\/script>
                <style>
                    @page { size: A4; margin: 8mm; }
                    * { box-sizing: border-box; margin: 0; padding: 0; }

                    body {
                        font-family: Arial, sans-serif;
                        background: #fff;
                    }

                    .grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 4mm;
                    }

                    .label {
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        padding: 4mm 3mm 3mm;
                        text-align: center;
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }

                    .barcode {
                        width: 100%;
                        height: auto;
                        max-height: 18mm;
                    }

                    .code {
                        font-size: 8pt;
                        font-weight: 700;
                        color: #333;
                        margin-top: 2mm;
                        letter-spacing: 0.5px;
                    }

                    .name {
                        font-size: 7pt;
                        color: #555;
                        margin-top: 1mm;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .price {
                        font-size: 8pt;
                        font-weight: 700;
                        color: #000;
                        margin-top: 1mm;
                    }

                    @media print {
                        body { width: 210mm; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="no-print" style="padding:8px 12px;background:#f0fdf4;border-bottom:1px solid #bbf7d0;display:flex;align-items:center;justify-content:space-between;">
                    <span style="font-size:13px;color:#065f46;font-weight:600;">
                        Preview Barcode — ${products.length} produk
                    </span>
                    <button onclick="window.print()" style="padding:6px 16px;background:#059669;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;">
                        🖨️ Cetak
                    </button>
                </div>

                <div class="grid" style="padding: 4mm;">
                    ${labels}
                </div>

                <script>
                    // Generate barcodes after DOM is ready
                    document.querySelectorAll('.barcode').forEach(function(svg) {
                        try {
                            JsBarcode(svg, svg.dataset.barcode, {
                                format:      'EAN13',
                                width:       1.5,
                                height:      40,
                                displayValue: true,
                                margin:      2,
                            });
                        } catch(e) {
                            // Code may be empty or invalid — show placeholder text
                            svg.outerHTML = '<p style="color:red;font-size:8pt;">Invalid</p>';
                        }
                    });
                <\/script>
            </body>
            </html>
        `);

        win.document.close();
    }

    return (
        <PrimaryButton
            type="button"
            icon={<Printer className="size-4" />}
            onClick={handlePrint}
        >
            Cetak Barcode
        </PrimaryButton>
    );
}
