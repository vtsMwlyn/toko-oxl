import { useState, useMemo } from 'react';

import Popup from '@/Components/Popup';
import Select from '@/Components/Select';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function ExportSpecificProduct({ isOpen, onClose, products, from, to }) {
    const [selected, setSelected] = useState(null);
    const [percent, setPercent] = useState(100);

    function handlePercentChange(e) {
        const val = Math.min(100, Math.max(1, parseInt(e.target.value) || 1));
        setPercent(val);
    }

    function handleDownload() {
        if (!selected) return;
        window.location.href = route('admin.sale.export.variant.specific', {
            variant: selected.variant.id,
            qty_percent: percent,
            from, to,
        });
    }

    const variantOptions = useMemo(() => {
        return products.flatMap(product =>
            product.variants.map(variant => ({
                value: variant.id,
                label: `${variant.code} — ${product.name}${variant.name ? ` (${variant.name})` : ''}`,
                variant: { ...variant, product },
            }))
        );
    }, [products]);

    return (
        <Popup title="Export Produk Spesifik" isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <Select
                options={variantOptions}
                value={selected}
                onChange={(option) => setSelected(option)}
                placeholder="Cari kode atau nama produk..."
                isClearable={true}
            />

            <div className="mt-4">
                <label className="block text-sm text-slate-600 mb-1.5">Persentase Qty</label>
                <div className="flex items-center gap-3">
                    <TextInput
                        type="text"
                        value={percent}
                        onChange={handlePercentChange}
                        className="w-24"
                    />
                    <span className="text-sm text-slate-500">%</span>
                    <input
                        type="range"
                        min={1}
                        max={100}
                        step={1}
                        value={percent}
                        onChange={handlePercentChange}
                        className="flex-1 accent-emerald-600"
                    />
                    <span className="text-sm text-slate-500 w-10 text-right">{percent}%</span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                    Contoh: qty 20 × 10% = 2.
                </p>
            </div>

            <div className="w-full flex justify-center mt-6">
                <PrimaryButton
                    type="button"
                    onClick={handleDownload}
                    disabled={!selected}
                >
                    Download .xlsx
                </PrimaryButton>
            </div>
        </Popup>
    );
}
