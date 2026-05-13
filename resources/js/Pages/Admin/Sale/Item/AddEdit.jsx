import { useState, useEffect } from 'react';

import Popup from '@/Components/Popup';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Select from '@/Components/Select';

import formatPrice from '@/Helpers/formatPrice';

function resolveDiscount(discounts, qty) {
    if (!discounts?.length || !qty) return null;
    const sorted = [...discounts].sort((a, b) => b.min_qty - a.min_qty);
    return sorted.find(d => Number(qty) >= d.min_qty) ?? null;
}

function resolvePrice(variant, discountTier, customerName) {
    if (discountTier) {
        return customerName?.trim()
            ? discountTier.customer_price
            : discountTier.normal_price;
    }
    return customerName?.trim()
        ? variant.product.customer_price
        : variant.product.normal_price;
}

export default function AddEdit({ mode, type, isOpen, onClose, onSave, item, products, customerName }) {
    const [errors, setErrors] = useState({});

    const variantOptions = products.flatMap(product =>
        product.variants.map(variant => ({
            value: variant.id,
            label: `${variant.code} — ${product.name}${variant.name ? ` (${variant.name})` : ''}`,
            variant: { ...variant, product },
        }))
    );

    const initialOption = item
        ? (variantOptions.find(o => o.value === item.variant_id) ?? null)
        : null;

    const [selectedOption, setSelectedOption] = useState(initialOption);
    const [qty,            setQty]            = useState(item?.qty      ?? '');
    const [price,          setPrice]          = useState(item?.price    ?? '');
    const [discount,       setDiscount]       = useState(item?.discount ?? '');

    const [priceTouched, setPriceTouched] = useState(false);

    const matched      = selectedOption?.variant ?? null;
    const discountTier = resolveDiscount(matched?.product?.discounts, qty);

    useEffect(() => {
        if (!matched) {
            if (!priceTouched) setPrice('');
            return;
        }
        if (!priceTouched) {
            setPrice(resolvePrice(matched, discountTier, customerName) ?? '');
        }
    }, [matched, qty, customerName]);

    function handleVariantChange(option) {
        setSelectedOption(option);
        setPriceTouched(false);
        if (errors.variant) setErrors(prev => ({ ...prev, variant: null }));
    }

    function handleQtyChange(e) {
        setQty(e.target.value);
    }

    function handlePriceChange(e) {
        setPrice(e.target.value);
        setPriceTouched(true);
    }

    function validate() {
        const newErrors = {};
        if (!matched)                    newErrors.variant  = 'Pilih produk terlebih dahulu.';
        if (!qty || Number(qty) <= 0)    newErrors.qty      = 'Qty harus lebih dari 0.';
        if (!price || Number(price) < 0) newErrors.price    = 'Harga tidak valid.';
        if (discount !== '' && Number(discount) < 0) newErrors.discount = 'Diskon tidak boleh negatif.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function handleSave(e) {
        e.preventDefault();
        if (!validate()) return;

        onSave({
            ...(item?._localId ? { _localId: item._localId } : {}),
            variant_id: matched.id,
            price:      Number(price),
            discount:   Number(discount) || 0,
            qty:        Number(qty),
        });
    }

    const discountNum = Number(discount) || 0;
    const priceNum    = Number(price)    || 0;
    const qtyNum      = Number(qty)      || 0;
    const subtotal    = (priceNum - discountNum) * qtyNum;

    const priceHint = (() => {
        if (!matched || priceTouched) return null;
        const isCustomer = !!customerName?.trim();
        if (discountTier) {
            return isCustomer
                ? `Harga diskon langganan (min. ${discountTier.min_qty} pcs)`
                : `Harga diskon normal (min. ${discountTier.min_qty} pcs)`;
        }
        return isCustomer ? 'Harga langganan diterapkan' : 'Harga normal diterapkan';
    })();

    const typeLabel = type === 'Sell' ? 'Produk Terjual' : 'Produk Retur';

    return (
        <Popup
            title={mode === 'Create' ? `Tambah ${typeLabel}` : `Ubah ${typeLabel}`}
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-sm"
        >
            <form onSubmit={handleSave} className="flex flex-col gap-4">

                {/* ── Variant searchable select ── */}
                <div className="grid gap-1">
                    <InputLabel value="Produk" />
                    <Select
                        options={variantOptions}
                        value={selectedOption}
                        onChange={handleVariantChange}
                        placeholder="Cari kode atau nama produk..."
                        isClearable={true}
                    />
                    <InputError message={errors.variant} />
                </div>

                {/* ── Qty ── */}
                <div className="grid gap-1">
                    <InputLabel htmlFor="item-qty" value="Qty" />
                    <TextInput
                        id="item-qty"
                        type="number"
                        min="1"
                        value={qty}
                        className="block w-full"
                        onChange={handleQtyChange}
                    />
                    <InputError message={errors.qty} />
                </div>

                {/* ── Price ── */}
                <div className="grid gap-1">
                    <InputLabel htmlFor="item-price" value="Harga (Rp)" />
                    <TextInput
                        id="item-price"
                        type="number"
                        min="0"
                        value={price}
                        className="block w-full"
                        placeholder="0"
                        onChange={handlePriceChange}
                    />
                    {priceHint && (
                        <p className="text-[11px] text-emerald-600 mt-0.5">{priceHint}</p>
                    )}
                    <InputError message={errors.price} />
                </div>

                {/* ── Discount ── */}
                <div className="grid gap-1">
                    <InputLabel htmlFor="item-discount" value="Diskon (Rp)" />
                    <TextInput
                        id="item-discount"
                        type="number"
                        min="0"
                        value={discount}
                        className="block w-full"
                        placeholder="0"
                        onChange={(e) => setDiscount(e.target.value)}
                    />
                    <InputError message={errors.discount} />
                </div>

                {/* ── Live subtotal ── */}
                {matched && qtyNum > 0 && (
                    <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-semibold text-slate-700">{formatPrice(subtotal)}</span>
                    </div>
                )}

                <div className="flex justify-center mt-2">
                    <PrimaryButton type="submit" className="w-36">
                        {mode === 'Create' ? 'Tambah' : 'Simpan'}
                    </PrimaryButton>
                </div>
            </form>
        </Popup>
    );
}
