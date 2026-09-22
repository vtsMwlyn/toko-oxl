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

/**
 * Compute the allowed price range for HeadCashier.
 * MIN: the cheapest customer_price across all special-price tiers,
 *      or the product's base customer_price when no tiers exist.
 * MAX: the product's base normal_price.
 */
function resolveHeadCashierPriceRange(variant) {
    if (!variant) return null;
    const tiers = variant.product?.discounts ?? [];
    const minPrice = tiers.length
        ? Math.min(...tiers.map(d => d.customer_price))
        : variant.product.customer_price;
    const maxPrice = variant.product.normal_price;
    return { min: minPrice, max: maxPrice };
}

export default function AddEdit({ mode, type, isOpen, onClose, onSave, item, products, customerName, existingItems = [], canEditPrice = false, priceUnrestricted = false }) {
    const [errors, setErrors] = useState({});

    const variantOptions = products.flatMap(product =>
        product.variants.map(variant => ({
            value: variant.id,
            label: `[${variant.code}] — ${product.name}${variant.name ? ` ${variant.name}` : ''}`,
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

    const [priceTouched, setPriceTouched] = useState(item?.price_edited ?? false);

    const matched = selectedOption?.variant ?? null;

    const effectiveQty = (() => {
        if (!matched) return Number(qty) || 0;
        const productId = matched.product.id;
        const otherQty = existingItems
            .filter(i => i._localId !== item?._localId)
            .filter(i => products.find(p => p.id === productId)?.variants.some(v => v.id === i.variant_id))
            .reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
        return otherQty + (Number(qty) || 0);
    })();

    const discountTier = resolveDiscount(matched?.product?.discounts, effectiveQty);

    const priceRange = canEditPrice && !priceUnrestricted && matched ? resolveHeadCashierPriceRange(matched) : null;

    useEffect(() => {
        if (!matched) {
            if (!priceTouched) setPrice('');
            return;
        }
        if (priceTouched) {
            // HeadCashier: auto-clamp if price goes out of allowed range
            if (canEditPrice && priceRange) {
                const clamped = Math.max(priceRange.min, Math.min(priceRange.max, Number(price)));
                if (clamped !== Number(price)) {
                    setPrice(clamped);
                }
            }
            return;
        }
        const auto = resolvePrice(matched, discountTier, customerName) ?? '';
        // HeadCashier: clamp auto price to allowed range
        if (canEditPrice && priceRange && auto !== '') {
            const clamped = Math.max(priceRange.min, Math.min(priceRange.max, Number(auto)));
            setPrice(clamped);
            return;
        }
        setPrice(auto);
    }, [matched, qty, customerName, existingItems]);

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
        else if (type === 'Sell' && matched) {
            // How much of this variant is in the current sale's OTHER items (not the one being edited)
            const variantOtherQty = existingItems
                .filter(i => i._localId !== item?._localId)
                .filter(i => i.variant_id === matched.id)
                .reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
            // How much of this variant is in the current sale's ALL items (including the one being edited)
            const myVariantQty = existingItems
                .filter(i => i.variant_id === matched.id)
                .reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
            // Net reservation by OTHER draft sales (subtract this sale's own contribution)
            const draftReservedByOthers = Math.max(0, (matched.draft_reserved ?? 0) - myVariantQty);
            const available = matched.stock - draftReservedByOthers;
            if (variantOtherQty + Number(qty) > available) {
                const hint = draftReservedByOthers > 0
                    ? ` (${draftReservedByOthers} direservasi draft lain)`
                    : (variantOtherQty > 0 ? ` (telah diinput: ${variantOtherQty})` : '');
                newErrors.qty = `Stok tidak cukup. Tersedia: ${available}${hint}`;
            }
        }
        if (!price || Number(price) < 0) newErrors.price = 'Harga tidak valid.';
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
            price_edited: priceTouched,
        });
    }

    const discountNum = Number(discount) || 0;
    const priceNum    = Number(price)    || 0;
    const qtyNum      = Number(qty)      || 0;
    const subtotal    = (priceNum - discountNum) * qtyNum;

    const priceHint = (() => {
        if (!matched) return null;
        if (canEditPrice && priceRange) {
            return `Kisaran harga: ${formatPrice(priceRange.min)} – ${formatPrice(priceRange.max)}`;
        }
        if (canEditPrice && priceUnrestricted) {
            return null; // Admin: no hint needed, full freedom
        }
        if (priceTouched) return null;
        const isCustomer = !!customerName?.trim();
        const totalNote  = effectiveQty > (Number(qty) || 0) ? ` (total ${effectiveQty} pcs)` : '';
        if (discountTier) {
            return isCustomer
                ? `Harga diskon langganan (min. ${discountTier.min_qty} pcs${totalNote})`
                : `Harga diskon normal (min. ${discountTier.min_qty} pcs${totalNote})`;
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
                    {type === 'Sell' && matched && !errors.qty && (() => {
                        const myVariantQty = existingItems
                            .filter(i => i.variant_id === matched.id)
                            .reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
                        const draftReservedByOthers = Math.max(0, (matched.draft_reserved ?? 0) - myVariantQty);
                        const available = matched.stock - draftReservedByOthers;
                        return (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Stok tersedia: <span className="font-medium">{available}</span>
                                {draftReservedByOthers > 0 && (
                                    <span className="text-amber-500 ml-1">({draftReservedByOthers} direservasi draft lain)</span>
                                )}
                            </p>
                        );
                    })()}
                    <InputError message={errors.qty} />
                </div>

                {/* ── Price ── */}
                <div className="grid gap-1">
                    <InputLabel htmlFor="item-price" value="Harga (Rp)" />
                    <TextInput
                        id="item-price"
                        type="number"
                        min={priceRange?.min ?? 0}
                        max={priceRange?.max ?? undefined}
                        value={price}
                        className={`block w-full ${!canEditPrice ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`}
                        placeholder="0"
                        disabled={!canEditPrice}
                        onChange={canEditPrice ? handlePriceChange : undefined}
                    />
                    {priceHint && (
                        <p className={`text-[11px] mt-0.5 ${canEditPrice ? 'text-amber-600' : 'text-emerald-600'}`}>{priceHint}</p>
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
