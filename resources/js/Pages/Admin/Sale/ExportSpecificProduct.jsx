import { useState, useMemo } from 'react';

import Popup from '@/Components/Popup';
import Select from '@/Components/Select';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ExportSpecificProduct({ isOpen, onClose, products }) {
    // State sekarang akan menyimpan seluruh objek option ( {value, label, variant} )
    const [selected, setSelected] = useState(null);

    function handleDownload() {
        if (!selected) return;
        // Menggunakan selected.value karena 'selected' adalah sebuah objek
        window.location.href = route('admin.sale.export.product.specific', { product: selected.value });
        // onClose();
    }

    // Membungkus mapping dengan useMemo agar performa lebih baik
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
                // Simpan seluruh objek 'option', bukan cuma 'option.value'
                onChange={(option) => setSelected(option)}
                placeholder="Cari kode atau nama produk..."
                isClearable={true}
            />

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
