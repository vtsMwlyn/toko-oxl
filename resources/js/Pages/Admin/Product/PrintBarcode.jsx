import { Printer } from "lucide-react"
import { useState } from "react"

import Popup from "@/Components/Popup"
import PrimaryButton from "@/Components/PrimaryButton"
import TextInput from "@/Components/TextInput"

export default function PrintBarcode({ variant, isOpen, onClose }) {
    const [printSettings, setPrintSettings] = useState({
        qty: 1,
        widthCm: 4,
        heightCm: 1.5,
        gapMm: 4,
        marginMm: 8,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPrintSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const executePrint = () => {
        const qty      = parseInt(printSettings.qty, 10);
        const widthCm  = parseFloat(printSettings.widthCm);
        const heightCm = parseFloat(printSettings.heightCm);
        const gapMm    = parseFloat(printSettings.gapMm);
        const marginMm = parseFloat(printSettings.marginMm);

        if (isNaN(qty) || qty <= 0)         return alert("Jumlah copy tidak valid.");
        if (isNaN(widthCm) || widthCm <= 0) return alert("Ukuran lebar tidak valid.");
        if (isNaN(heightCm) || heightCm <= 0) return alert("Ukuran tinggi tidak valid.");
        if (isNaN(gapMm) || gapMm < 0)     return alert("Ukuran gap tidak valid.");
        if (isNaN(marginMm) || marginMm < 0) return alert("Ukuran margin tidak valid.");

        onClose();

        const copies = Array(qty).fill(variant);

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const labels = copies.map((v, i) => `
            <div class="label">
                <svg class="barcode" id="bc-${i}" data-barcode="${v.barcode}"></svg>
            </div>
        `).join('');

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Cetak Barcode Produk</title>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js"><\/script>
                <style>
                    @page { size: A4; margin: ${marginMm}mm; }
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: Arial, sans-serif; background: #fff; }

                    .grid { display: flex; flex-wrap: wrap; gap: ${gapMm}mm; }
                    .label {
                        padding: 2mm;
                        text-align: center;
                        break-inside: avoid;
                        page-break-inside: avoid;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .barcode {
                        width: ${widthCm}cm !important;
                        height: ${heightCm}cm !important;
                    }
                </style>
            </head>
            <body>
                <div class="grid" style="padding: 4mm;">
                    ${labels}
                </div>
                <script>
                    document.querySelectorAll('.barcode').forEach(function(svg) {
                        try {
                            JsBarcode(svg, svg.dataset.barcode, {
                                format:      'EAN13',
                                width:       2,
                                height:      50,
                                displayValue: true,
                                margin:      2,
                            });
                        } catch(e) {
                            svg.outerHTML = '<p style="color:red;font-size:8pt;">Invalid</p>';
                        }
                    });

                    setTimeout(function() {
                        window.print();
                    }, 500);
                <\/script>
            </body>
            </html>
        `;

        iframe.srcdoc = htmlContent;

        iframe.onload = () => {
            iframe.contentWindow.onafterprint = () => {
                document.body.removeChild(iframe);
            };
        };
    };

    return (
        <Popup
            title="Pengaturan Cetak"
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-sm"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Copy</label>
                    <TextInput
                        type="number"
                        name="qty"
                        value={printSettings.qty}
                        onChange={handleInputChange}
                        className=" w-full"
                        min="1"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Lebar (cm)</label>
                        <TextInput
                            type="number"
                            name="widthCm"
                            value={printSettings.widthCm}
                            onChange={handleInputChange}
                            className=" w-full"
                            step="0.1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tinggi (cm)</label>
                        <TextInput
                            type="number"
                            name="heightCm"
                            value={printSettings.heightCm}
                            onChange={handleInputChange}
                            className=" w-full"
                            step="0.1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Gap (mm)</label>
                        <TextInput
                            type="number"
                            name="gapMm"
                            value={printSettings.gapMm}
                            onChange={handleInputChange}
                            className=" w-full"
                            step="0.5"
                            min="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Margin Halaman (mm)</label>
                        <TextInput
                            type="number"
                            name="marginMm"
                            value={printSettings.marginMm}
                            onChange={handleInputChange}
                            className=" w-full"
                            step="1"
                            min="0"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    Batal
                </button>
                <PrimaryButton icon={<Printer className="size-4" />} type="button" onClick={executePrint}>
                    Lanjut Cetak
                </PrimaryButton>
            </div>
        </Popup>
    );
}
