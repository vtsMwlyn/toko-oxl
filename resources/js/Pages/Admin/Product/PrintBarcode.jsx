import { Printer } from "lucide-react"
import { useState, useEffect } from "react"

import Popup from "@/Components/Popup"
import PrimaryButton from "@/Components/PrimaryButton"
import TextInput from "@/Components/TextInput"

function FieldNum({ label, name, value, onChange, step = "1", min = "0" }) {
    return (
        <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
            <TextInput
                type="number" name={name} value={value} onChange={onChange}
                className="w-full" step={step} min={min}
            />
        </div>
    );
}

const DEFAULTS = {
    qty:           1,
    widthCm:       4,
    heightCm:      1.5,
    gapXMm:        4,
    gapYMm:        4,
    marginTopMm:   8,
    marginRightMm: 8,
    marginBottomMm:8,
    marginLeftMm:  8,
};

function apiToState(c) {
    return {
        qty:            c.qty           ?? DEFAULTS.qty,
        widthCm:        c.width_cm      ?? DEFAULTS.widthCm,
        heightCm:       c.height_cm     ?? DEFAULTS.heightCm,
        gapXMm:         c.gap_x_mm      ?? DEFAULTS.gapXMm,
        gapYMm:         c.gap_y_mm      ?? DEFAULTS.gapYMm,
        marginTopMm:    c.margin_top_mm    ?? DEFAULTS.marginTopMm,
        marginRightMm:  c.margin_right_mm  ?? DEFAULTS.marginRightMm,
        marginBottomMm: c.margin_bottom_mm ?? DEFAULTS.marginBottomMm,
        marginLeftMm:   c.margin_left_mm   ?? DEFAULTS.marginLeftMm,
    };
}

export default function PrintBarcode({ variant, isOpen, onClose }) {
    const [s, setS] = useState(DEFAULTS);

    useEffect(() => {
        if (!isOpen) return;
        axios.get(route('admin.barcode-print-config.show'))
            .then(res => setS(apiToState(res.data)))
            .catch(() => {});
    }, [isOpen]);

    const set = (e) => {
        const { name, value } = e.target;
        setS(prev => ({ ...prev, [name]: value }));
    };

    const executePrint = () => {
        const qty            = parseInt(s.qty, 10);
        const widthCm        = parseFloat(s.widthCm);
        const heightCm       = parseFloat(s.heightCm);
        const gapXMm         = parseFloat(s.gapXMm);
        const gapYMm         = parseFloat(s.gapYMm);
        const marginTopMm    = parseFloat(s.marginTopMm);
        const marginRightMm  = parseFloat(s.marginRightMm);
        const marginBottomMm = parseFloat(s.marginBottomMm);
        const marginLeftMm   = parseFloat(s.marginLeftMm);

        if (isNaN(qty) || qty <= 0)              return alert("Jumlah copy tidak valid.");
        if (isNaN(widthCm) || widthCm <= 0)      return alert("Lebar tidak valid.");
        if (isNaN(heightCm) || heightCm <= 0)    return alert("Tinggi tidak valid.");
        if (isNaN(gapXMm) || gapXMm < 0)        return alert("Gap X tidak valid.");
        if (isNaN(gapYMm) || gapYMm < 0)        return alert("Gap Y tidak valid.");
        if ([marginTopMm, marginRightMm, marginBottomMm, marginLeftMm].some(v => isNaN(v) || v < 0))
            return alert("Margin tidak valid.");

        axios.post(route('admin.barcode-print-config.update'), {
            qty,
            width_cm:          widthCm,
            height_cm:         heightCm,
            gap_x_mm:          gapXMm,
            gap_y_mm:          gapYMm,
            margin_top_mm:     marginTopMm,
            margin_right_mm:   marginRightMm,
            margin_bottom_mm:  marginBottomMm,
            margin_left_mm:    marginLeftMm,
        }).catch(() => {});

        onClose();

        const copies = Array(qty).fill(variant);

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
                    @page { size: A4; margin: 0; }
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body {
                        font-family: Arial, sans-serif;
                        background: #fff;
                        padding: ${marginTopMm}mm ${marginRightMm}mm ${marginBottomMm}mm ${marginLeftMm}mm;
                    }

                    .grid {
                        display: flex;
                        flex-wrap: wrap;
                        column-gap: ${gapXMm}mm;
                        row-gap: ${gapYMm}mm;
                    }
                    .label {
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
                <div class="grid">
                    ${labels}
                </div>
                <script>
                    document.querySelectorAll('.barcode').forEach(function(svg) {
                        try {
                            JsBarcode(svg, svg.dataset.barcode, {
                                format:       'EAN13',
                                width:        2,
                                height:       50,
                                displayValue: true,
                                margin:       2,
                            });
                        } catch(e) {
                            svg.outerHTML = '<p style="color:red;font-size:8pt;">Invalid</p>';
                        }
                    });
                    setTimeout(function() { window.print(); }, 500);
                <\/script>
            </body>
            </html>
        `;

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        iframe.srcdoc = htmlContent;
        iframe.onload = () => {
            iframe.contentWindow.onafterprint = () => document.body.removeChild(iframe);
        };
    };

    return (
        <Popup title="Pengaturan Cetak" isOpen={isOpen} onClose={onClose} className="max-w-sm">
            <div className="space-y-5">

                {/* Qty */}
                <FieldNum label="Jumlah Copy" name="qty" value={s.qty} onChange={set} min="1" />

                {/* Label size */}
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Ukuran Label</p>
                    <div className="grid grid-cols-2 gap-3">
                        <FieldNum label="Lebar (cm)"  name="widthCm"  value={s.widthCm}  onChange={set} step="0.1" min="0.1" />
                        <FieldNum label="Tinggi (cm)" name="heightCm" value={s.heightCm} onChange={set} step="0.1" min="0.1" />
                    </div>
                </div>

                {/* Gap */}
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Gap antar Label (mm)</p>
                    <div className="grid grid-cols-2 gap-3">
                        <FieldNum label="Gap X (horizontal)" name="gapXMm" value={s.gapXMm} onChange={set} step="0.5" />
                        <FieldNum label="Gap Y (vertikal)"   name="gapYMm" value={s.gapYMm} onChange={set} step="0.5" />
                    </div>
                </div>

                {/* Page margin */}
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Margin Halaman (mm)</p>
                    <div className="grid grid-cols-2 gap-3">
                        <FieldNum label="Atas"   name="marginTopMm"    value={s.marginTopMm}    onChange={set} />
                        <FieldNum label="Bawah"  name="marginBottomMm" value={s.marginBottomMm} onChange={set} />
                        <FieldNum label="Kiri"   name="marginLeftMm"   value={s.marginLeftMm}   onChange={set} />
                        <FieldNum label="Kanan"  name="marginRightMm"  value={s.marginRightMm}  onChange={set} />
                    </div>
                </div>

            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                    type="button" onClick={onClose}
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
