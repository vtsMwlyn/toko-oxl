import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import PrimaryButton from "@/Components/PrimaryButton";
import Popup from "@/Components/Popup";
import { Download, Printer } from "lucide-react";
import formatPrice from "@/Helpers/formatPrice";

export default function BarcodeDownload({ product }) {
    const svgRef = useRef(null);
    const [code, setCode] = useState(product.barcode);

    // State untuk mengontrol visibilitas Modal Print Settings
    const [showPrintModal, setShowPrintModal] = useState(false);

    // State untuk menyimpan input user
    const [printSettings, setPrintSettings] = useState({
        qty: 1,
        widthCm: 4,
        heightCm: 1.5
    });

    useEffect(() => {
        JsBarcode(svgRef.current, code, {
            format: "EAN13",
            width: 2,
            height: 100,
            displayValue: true,
        });
    }, [code]);

    const downloadPNG = () => {
        const svg = svgRef.current;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            const link = document.createElement("a");
            link.download = `${code}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        };

        img.src =
            "data:image/svg+xml;base64," +
            btoa(unescape(encodeURIComponent(svgData)));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPrintSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const executePrint = () => {
        const qty = parseInt(printSettings.qty, 10);
        const widthCm = parseFloat(printSettings.widthCm);
        const heightCm = parseFloat(printSettings.heightCm);

        if (isNaN(qty) || qty <= 0) return alert("Jumlah copy tidak valid.");
        if (isNaN(widthCm) || widthCm <= 0) return alert("Ukuran lebar tidak valid.");
        if (isNaN(heightCm) || heightCm <= 0) return alert("Ukuran tinggi tidak valid.");

        setShowPrintModal(false);

        const products = Array(qty).fill(product);

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const labels = products.map((p, i) => `
            <div class="label">
                <svg class="barcode" id="bc-${i}" data-barcode="${p.barcode}"></svg>
                <p class="name">${p.name}${p.variant ? ` — ${p.variant}` : ''}</p>
                <p class="price">${formatPrice(p.normal_price ?? 0)}</p>
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
                    @page { size: A4; margin: 8mm; }
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: Arial, sans-serif; background: #fff; }

                    .grid { display: flex; flex-wrap: wrap; gap: 4mm; }
                    .label {
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        padding: 4mm 3mm 3mm;
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

                    .name { font-size: 7pt; color: #555; margin-top: 1mm; max-width: ${widthCm}cm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                    .price { font-size: 8pt; font-weight: 700; color: #000; margin-top: 1mm; }
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

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(htmlContent);
        doc.close();

        iframe.contentWindow.onafterprint = () => {
            document.body.removeChild(iframe);
        };
    };

    return (
        <div>
            <svg className="w-48" ref={svgRef}></svg>

            <div className="flex items-center gap-3 mt-2">
                <PrimaryButton icon={<Download className="size-4" />} type="button" onClick={downloadPNG}>
                    Download
                </PrimaryButton>

                <PrimaryButton icon={<Printer className="size-4" />} type="button" onClick={() => setShowPrintModal(true)}>
                    Cetak
                </PrimaryButton>
            </div>

            {/* Menggunakan komponen Popup dari sistem Anda */}
            <Popup
                title="Pengaturan Cetak"
                isOpen={showPrintModal}
                onClose={() => setShowPrintModal(false)}
                className="max-w-sm"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Copy</label>
                        <input
                            type="number"
                            name="qty"
                            value={printSettings.qty}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            min="1"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Lebar (cm)</label>
                            <input
                                type="number"
                                name="widthCm"
                                value={printSettings.widthCm}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                step="0.1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tinggi (cm)</label>
                            <input
                                type="number"
                                name="heightCm"
                                value={printSettings.heightCm}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                step="0.1"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Buttons diletakkan di bawah form */}
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => setShowPrintModal(false)}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Batal
                    </button>
                    <PrimaryButton icon={<Printer className="size-4" />} type="button" onClick={executePrint}>
                        Lanjut Cetak
                    </PrimaryButton>
                </div>
            </Popup>
        </div>
    );
}
