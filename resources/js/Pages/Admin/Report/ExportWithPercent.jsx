import { useState } from 'react';
import { FileDown, X } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';

const EXPORT_TYPES = [
    { key: 'product',  label: 'Export per Produk',      routeName: 'admin.sale.export.byProduct' },
    { key: 'sale',     label: 'Export per Transaksi',   routeName: 'admin.sale.export.bySale'    },
];

export default function ExportWithPercent({ type, onClose, from, to }) {
    const [percent, setPercent] = useState(100);

    const exportType = EXPORT_TYPES.find(t => t.key === type);

    const handleChange = (val) => {
        const clamped = Math.min(100, Math.max(1, parseInt(val) || 1));
        setPercent(clamped);
    };

    const handleDownload = () => {
        const url = route(exportType.routeName, { qty_percent: percent, from, to });
        window.location.href = url;
        onClose();
    };

    if (!exportType) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">

                {/* Close */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                    <X className="size-4" />
                </button>

                {/* Header */}
                <h2 className="text-base font-semibold text-slate-800 mb-1">{exportType.label}</h2>
                <p className="text-sm text-slate-500 mb-4">Atur persentase qty yang akan diekspor.</p>

                {/* Badge */}
                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs rounded-md px-2.5 py-1 mb-4">
                    <FileDown className="size-3.5" />
                    {exportType.label}
                </span>

                {/* Number input */}
                <label className="block text-sm text-slate-600 mb-1.5">Persentase Qty</label>
                <div className="flex items-center gap-2 mb-1.5">
                    <input
                        type="text"
                        value={percent}
                        onChange={e => handleChange(e.target.value)}
                        className="w-20 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-slate-500">%</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                    Qty asli dikalikan persentase ini. Contoh: qty 20 × 10% = 2.
                </p>

                {/* Slider */}
                <div className="flex items-center gap-3 mb-6">
                    <input
                        type="range"
                        min={1}
                        max={100}
                        step={1}
                        value={percent}
                        onChange={e => handleChange(e.target.value)}
                        className="flex-1 accent-emerald-600"
                    />
                    <span className="text-sm text-slate-500 w-10 text-right">{percent}%</span>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <PrimaryButton
                        icon={<FileDown className="size-4" />}
                        type="button"
                        onClick={handleDownload}
                    >
                        Download
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}
