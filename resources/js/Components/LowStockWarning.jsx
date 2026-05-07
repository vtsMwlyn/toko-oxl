import { AlertTriangle } from "lucide-react";

export default function LowStockWarning({ variants }) {
    if (variants.length === 0) return null;

    return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                <p className="text-sm font-semibold text-amber-700">
                    {variants.length} varian memiliki stok rendah
                </p>
            </div>
            <div className="flex flex-col gap-1">
                {variants.map((variant) => (
                    <div key={variant.id} className="flex justify-between items-center text-xs px-3 py-1.5 rounded-lg bg-white border border-amber-100">
                        <span className="text-slate-600">
                            {variant.product.name}
                            {variant.name ? ` — ${variant.name}` : ''} ≤ {variant.low_stock_warning}
                        </span>
                        <span className={`font-bold ${variant.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                            {variant.stock === 0 ? 'Habis' : `Sisa ${variant.stock}`}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
