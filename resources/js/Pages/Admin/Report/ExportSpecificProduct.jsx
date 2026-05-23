import { useState, useMemo } from 'react';

import Popup from '@/Components/Popup';
import Select from '@/Components/Select';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function ExportSpecificProduct({ isOpen, onClose, products, from, to }) {
    const [mode,     setMode]    = useState('variant'); // 'variant' | 'product'
    const [selected, setSelected] = useState(null);
    const [percent,  setPercent]  = useState(100);

    function handlePercentChange(e) {
        const val = Math.min(100, Math.max(1, parseInt(e.target.value) || 1));
        setPercent(val);
    }

    function handleModeChange(newMode) {
        setMode(newMode);
        setSelected(null);
    }

    function handleDownload() {
        if (!selected) return;

        const url = mode === 'variant'
            ? route('admin.sale.export.byVariant', {
                variant:     selected.value,
                qty_percent: percent,
                from,
                to,
            })
            : route('admin.sale.export.byProductGroup', {
                product:     selected.value,
                qty_percent: percent,
                from,
                to,
            });

        window.location.href = url;
    }

    const variantOptions = useMemo(() =>
        products.flatMap(product =>
            product.variants.map(variant => ({
                value:   variant.id,
                label:   `${variant.code} — ${product.name}${variant.name ? ` (${variant.name})` : ''}`,
                variant: { ...variant, product },
            }))
        ),
    [products]);

    const productOptions = useMemo(() =>
        products.map(product => ({
            value:   product.id,
            label:   product.name,
            product,
        })),
    [products]);

    const options     = mode === 'variant' ? variantOptions : productOptions;
    const placeholder = mode === 'variant'
        ? 'Cari kode atau nama varian...'
        : 'Cari nama produk...';

    return (
        <Popup
            title="Export Produk Spesifik"
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-lg"
        >
            {/* ── Mode toggle ── */}
            <div className="flex rounded-lg border border-slate-200 overflow-hidden mb-4 text-sm">
                <button
                    type="button"
                    onClick={() => handleModeChange('variant')}
                    className={`flex-1 py-2 font-medium transition-colors ${
                        mode === 'variant'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    Per Varian
                </button>
                <button
                    type="button"
                    onClick={() => handleModeChange('product')}
                    className={`flex-1 py-2 font-medium transition-colors ${
                        mode === 'product'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    Per Produk (Semua Varian)
                </button>
            </div>

            {/* ── Select ── */}
            <Select
                options={options}
                value={selected}
                onChange={option => setSelected(option)}
                placeholder={placeholder}
                isClearable
            />

            {/* ── Qty percent ── */}
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
                        onChange={e => handlePercentChange(e)}
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
