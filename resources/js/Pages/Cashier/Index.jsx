import { router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Plus, Trash2, Printer, ScanBarcode } from 'lucide-react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Select from '@/Components/Select';
import Table from '@/Components/Table';
import Receipt from '@/Pages/Admin/Sale/Receipt';

import formatPrice from '@/Helpers/formatPrice';

// ── Discount / price resolution helpers ──────────────────────────────────────
function resolveDiscount(discounts, qty) {
    if (!discounts?.length || !qty) return null;
    const sorted = [...discounts].sort((a, b) => b.min_qty - a.min_qty);
    return sorted.find(d => Number(qty) >= d.min_qty) ?? null;
}

function resolveAutoPrice(product, discountTier, customerName) {
    if (!product) return '';
    const isCustomer = !!customerName?.trim();
    if (discountTier) {
        return isCustomer ? discountTier.customer_price : discountTier.normal_price;
    }
    return isCustomer ? product.customer_price : product.normal_price;
}

// ── Blank item input state ────────────────────────────────────────────────────
function blankItem() {
    return { selectedOption: null, qty: 1, price: 0, discount: 0, priceTouched: false };
}

// ── Item input row (inline, no popup) ────────────────────────────────────────
function ItemInputRow({ label, products, customerName, onAdd }) {
    const [field,      setField]      = useState(blankItem());
    const [errors,     setErrors]     = useState({});
    const [barcodeVal, setBarcodeVal] = useState('');
    const [barcodeErr, setBarcodeErr] = useState('');

    const qtyRef     = useRef(null);
    const barcodeRef = useRef(null);

    const productOptions = products.map(p => ({
        value:   p.id,
        label:   `${p.code} — ${p.name}${p.variant ? ` (${p.variant})` : ''}`,
        product: p,
    }));

    const matched      = field.selectedOption?.product ?? null;
    const discountTier = resolveDiscount(matched?.discounts, field.qty);

    // Auto-set price when product, qty, or customerName changes
    useEffect(() => {
        if (field.priceTouched) return;
        const auto = resolveAutoPrice(matched, discountTier, customerName);
        setField(f => ({ ...f, price: auto ?? '' }));
    }, [matched, field.qty, customerName, field.priceTouched]);

    const priceHint = (() => {
        if (!matched || field.priceTouched) return null;
        const isCustomer = !!customerName?.trim();
        if (discountTier) return isCustomer
            ? `Harga diskon langganan (min. ${discountTier.min_qty} pcs)`
            : `Harga diskon normal (min. ${discountTier.min_qty} pcs)`;
        return isCustomer ? 'Harga langganan' : 'Harga normal';
    })();

    // ── Barcode scan handler ──────────────────────────────────────────────────
    // Barcode readers act like a keyboard: type code + send Enter.
    // On Enter we look up the product, populate the select, clear the barcode
    // field, and move focus to qty so the cashier stays on keyboard flow.
    function handleBarcodeKeyDown(e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();

        const code = barcodeVal.trim();
        if (!code) return;

        const found = products.find(p => p.barcode === code);
        if (!found) {
            setBarcodeErr(`Produk dengan kode "${code}" tidak ditemukan.`);
            setBarcodeVal('');
            return;
        }

        const option = productOptions.find(o => o.value === found.id);
        setField(f => ({ ...f, selectedOption: option, priceTouched: false }));
        setBarcodeVal('');
        setBarcodeErr('');
        setTimeout(() => qtyRef.current?.focus(), 0);
    }

    // Enter on qty moves focus to price field
    function handleQtyKeyDown(e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        document.getElementById(`${label}-price`)?.focus();
    }

    // Enter on discount triggers add (completes the row without clicking)
    function handleDiscountKeyDown(e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        handleAdd();
    }

    // ── Add item ──────────────────────────────────────────────────────────────
    function handleAdd() {
        const newErrors = {};
        if (!matched)                             newErrors.product = 'Pilih produk.';
        if (!field.qty || Number(field.qty) <= 0) newErrors.qty     = 'Qty > 0.';
        if (field.price === '' || Number(field.price) < 0) newErrors.price = 'Harga tidak valid.';
        setErrors(newErrors);
        if (Object.keys(newErrors).length) return;

        onAdd({
            _localId:   Date.now(),
            product_id: matched.id,
            price:      Number(field.price),
            discount:   Number(field.discount) || 0,
            qty:        Number(field.qty),
        });

        setField(blankItem());
        setErrors({});
        // Return focus to barcode field for the next scan
        setTimeout(() => barcodeRef.current?.focus(), 0);
    }

    const qtyNum      = Number(field.qty)      || 0;
    const priceNum    = Number(field.price)    || 0;
    const discountNum = Number(field.discount) || 0;
    const subtotal    = (priceNum - discountNum) * qtyNum;

    return (
        <div className="border border-emerald-100 rounded-xl p-4 bg-emerald-50/40">
            <p className="text-xs font-semibold text-emerald-700 mb-3">{label}</p>

            {/* ── Barcode input ── */}
            <div className="grid gap-1 mb-3">
                <InputLabel htmlFor={`${label}-barcode`} value="Scan Barcode / Kode Produk" />
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none">
                        <ScanBarcode size={16} />
                    </span>
                    <input
                        ref={barcodeRef}
                        id={`${label}-barcode`}
                        type="text"
                        value={barcodeVal}
                        onChange={e => { setBarcodeVal(e.target.value); setBarcodeErr(''); }}
                        onKeyDown={handleBarcodeKeyDown}
                        placeholder="Arahkan scanner atau ketik kode, lalu Enter..."
                        autoComplete="off"
                        className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>
                {barcodeErr && <p className="text-xs text-red-500 mt-0.5">{barcodeErr}</p>}
            </div>

            {/* ── Product select (manual fallback) ── */}
            <div className="grid gap-1 mb-3">
                <InputLabel value="Atau pilih manual" />
                <Select
                    options={productOptions}
                    value={field.selectedOption}
                    onChange={opt => setField(f => ({ ...f, selectedOption: opt, priceTouched: false }))}
                    placeholder="Cari kode atau nama produk..."
                    isClearable
                />
                <InputError message={errors.product} />
            </div>

            {/* ── Qty · price · discount ── */}
            <div className="grid grid-cols-3 items-start gap-3 mb-3">
                <div className="grid gap-1">
                    <InputLabel htmlFor={`${label}-qty`} value="Qty" />
                    <TextInput
                        ref={qtyRef}
                        id={`${label}-qty`}
                        type="number" min="1"
                        value={field.qty}
                        className="block w-full"
                        onChange={e => setField(f => ({ ...f, qty: e.target.value }))}
                        onKeyDown={handleQtyKeyDown}
                    />
                    <InputError message={errors.qty} />
                </div>

                <div className="grid gap-1">
                    <InputLabel htmlFor={`${label}-price`} value="Harga (Rp)" />
                    <TextInput
                        id={`${label}-price`}
                        type="number" min="0"
                        value={field.price}
                        className="block w-full"
                        onChange={e => setField(f => ({ ...f, price: e.target.value, priceTouched: true }))}
                    />
                    {priceHint && <p className="text-[10px] text-emerald-600">{priceHint}</p>}
                    <InputError message={errors.price} />
                </div>

                <div className="grid gap-1">
                    <InputLabel htmlFor={`${label}-discount`} value="Diskon (Rp)" />
                    <TextInput
                        id={`${label}-discount`}
                        type="number" min="0"
                        value={field.discount}
                        className="block w-full"
                        onChange={e => setField(f => ({ ...f, discount: e.target.value }))}
                        onKeyDown={handleDiscountKeyDown}
                    />
                </div>
            </div>

            {/* ── Subtotal + add ── */}
            <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">
                    {matched && qtyNum > 0
                        ? <>Subtotal: <span className="font-semibold text-slate-700">{formatPrice(subtotal)}</span></>
                        : <span className="text-slate-300">—</span>
                    }
                </p>
                <PrimaryButton type="button" icon={<Plus className="size-4" />} onClick={handleAdd}>
                    Tambah
                </PrimaryButton>
            </div>
        </div>
    );
}

// ── Item list table ───────────────────────────────────────────────────────────
function ItemTable({ items, products, onRemove }) {
    if (items.length === 0) return null;

    return (
        <Table
            isEmpty={false}
            headers={['Produk', 'Harga', 'Diskon', 'Qty', 'Subtotal', '']}
            disableHeight={true}
        >
            {items.map((item, index) => {
                const product  = products.find(p => p.id === item.product_id);
                const subtotal = (item.price - (item.discount ?? 0)) * item.qty;
                return (
                    <tr key={item._localId ?? index} className="hover:bg-slate-50">
                        <td>
                            <p className="font-medium">{product?.name ?? '—'}</p>
                            <p className="text-xs text-slate-400">{product?.code}{product?.variant ? ` · ${product.variant}` : ''}</p>
                        </td>
                        <td>{formatPrice(item.price)}</td>
                        <td>{item.discount ? formatPrice(item.discount) : <span className="text-slate-300">—</span>}</td>
                        <td>{item.qty}</td>
                        <td className="font-semibold">{formatPrice(subtotal)}</td>
                        <td>
                            <PrimaryButton
                                styled={false}
                                className="text-red-400 hover:text-red-600"
                                icon={<Trash2 className="size-4" />}
                                type="button"
                                onClick={() => onRemove(item._localId)}
                            />
                        </td>
                    </tr>
                );
            })}
        </Table>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Index({ products }) {
    const [loading,     setLoading]     = useState(false);
    const [success,     setSuccess]     = useState(false);
    const [savedSale,   setSavedSale]   = useState(null);
    const [soldItems,   setSoldItems]   = useState([]);
    const [returnItems, setReturnItems] = useState([]);

    const { data, setData, errors, setError, reset } = useForm({
        date:          new Date().toISOString().slice(0, 10),
        time:          new Date().toTimeString().slice(0, 5),
        customer_name: '',
        status:        'fixed',
    });

    function addItem(type, item) {
        const setter = type === 'Sell' ? setSoldItems : setReturnItems;
        setter(prev => [...prev, item]);
    }

    function removeItem(type, localId) {
        const setter = type === 'Sell' ? setSoldItems : setReturnItems;
        setter(prev => prev.filter(i => i._localId !== localId));
    }

    function resetForm() {
        reset();
        setSoldItems([]);
        setReturnItems([]);
        setSavedSale(null);
        setSuccess(false);
    }

    function submit(e) {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...data,
            items: [
                ...soldItems.map(({ _localId, ...i })   => ({ ...i, type: 'Sell' })),
                ...returnItems.map(({ _localId, ...i }) => ({ ...i, type: 'Return' })),
            ],
        };

        router.post(route('cashier.sale.store'), payload, {
            onSuccess: () => {
                setSavedSale({
                    ...data,
                    items: [
                        ...soldItems.map(i => ({ ...i, type: 'Sell' })),
                        ...returnItems.map(i => ({ ...i, type: 'Return' })),
                    ],
                });
                setSuccess(true);
            },
            onError: serverErrors => {
                Object.entries(serverErrors).forEach(([key, msg]) => setError(key, msg));
            },
            onFinish: () => setLoading(false),
        });
    }

    const soldTotal   = soldItems.reduce((s, i)   => s + (i.price - (i.discount ?? 0)) * i.qty, 0);
    const returnTotal = returnItems.reduce((s, i) => s + (i.price - (i.discount ?? 0)) * i.qty, 0);
    const grandTotal  = soldTotal - returnTotal;

    // ── Success screen ────────────────────────────────────────────────────────
    if (success && savedSale) {
        return (
            <AuthenticatedLayout title="Kasir">
                <Head title="Kasir" />
                <div className="max-w-sm mx-auto bg-white rounded-2xl border border-emerald-100 p-8 flex flex-col items-center gap-5 text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                            stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-emerald-900">Transaksi Berhasil!</h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Total: <span className="font-semibold text-emerald-700">{formatPrice(grandTotal)}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Receipt sale={savedSale} products={products} />
                        <PrimaryButton type="button" onClick={resetForm}>Transaksi Baru</PrimaryButton>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // ── Main form ─────────────────────────────────────────────────────────────
    return (
        <AuthenticatedLayout title="Kasir">
            <Head title="Kasir" />

            <form onSubmit={submit} className="flex flex-col gap-4">

                {/* ── Transaction info ── */}
                <div className="bg-white rounded-2xl border border-emerald-100 p-5">
                    <h2 className="text-sm font-bold text-emerald-900 mb-4">Informasi Transaksi</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="grid gap-1">
                            <InputLabel htmlFor="date" value="Tanggal" />
                            <TextInput
                                id="date" type="date" value={data.date}
                                className="block w-full"
                                onChange={e => setData('date', e.target.value)}
                            />
                            <InputError message={errors.date} />
                        </div>
                        <div className="grid gap-1">
                            <InputLabel htmlFor="time" value="Waktu" />
                            <TextInput
                                id="time" type="time" value={data.time}
                                className="block w-full"
                                onChange={e => setData('time', e.target.value)}
                            />
                            <InputError message={errors.time} />
                        </div>
                        <div className="grid gap-1 md:col-span-2">
                            <InputLabel htmlFor="customer_name" value="Nama Pelanggan" />
                            <TextInput
                                id="customer_name" value={data.customer_name}
                                className="block w-full"
                                placeholder="Opsional — isi untuk harga langganan"
                                onChange={e => setData('customer_name', e.target.value)}
                            />
                            <InputError message={errors.customer_name} />
                        </div>
                    </div>
                </div>

                {/* ── Sold items ── */}
                <div className="bg-white rounded-2xl border border-emerald-100 p-5">
                    <h2 className="text-sm font-bold text-emerald-900 mb-4">Produk Terjual</h2>

                    <ItemInputRow
                        label="Tambah produk terjual"
                        products={products}
                        customerName={data.customer_name}
                        onAdd={item => addItem('Sell', item)}
                    />

                    {soldItems.length > 0 && (
                        <div className="mt-4">
                            <ItemTable
                                items={soldItems}
                                products={products}
                                onRemove={localId => removeItem('Sell', localId)}
                            />
                            <div className="flex justify-end mt-2">
                                <p className="text-sm text-slate-500">
                                    Subtotal: <span className="font-semibold text-slate-700">{formatPrice(soldTotal)}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Return items ── */}
                <div className="bg-white rounded-2xl border border-emerald-100 p-5">
                    <h2 className="text-sm font-bold text-emerald-900 mb-4">Produk Retur</h2>

                    <ItemInputRow
                        label="Tambah produk retur"
                        products={products}
                        customerName={data.customer_name}
                        onAdd={item => addItem('Return', item)}
                    />

                    {returnItems.length > 0 && (
                        <div className="mt-4">
                            <ItemTable
                                items={returnItems}
                                products={products}
                                onRemove={localId => removeItem('Return', localId)}
                            />
                            <div className="flex justify-end mt-2">
                                <p className="text-sm text-slate-500">
                                    Subtotal Retur: <span className="font-semibold text-slate-700">{formatPrice(returnTotal)}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Total + actions ── */}
                <div className="bg-white rounded-2xl border border-emerald-100 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Total breakdown */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-3">
                        {returnItems.length > 0 && (
                            <>
                                <div className="flex justify-between gap-10 text-xs text-slate-400 mb-0.5">
                                    <span>Penjualan</span><span>{formatPrice(soldTotal)}</span>
                                </div>
                                <div className="flex justify-between gap-10 text-xs text-red-400 mb-1">
                                    <span>Retur</span><span>- {formatPrice(returnTotal)}</span>
                                </div>
                            </>
                        )}
                        <p className="text-xs text-emerald-500 mb-0.5">Total</p>
                        <p className="text-2xl font-bold text-emerald-700">{formatPrice(grandTotal)}</p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        {/* Preview receipt before saving — pass a "draft" sale object */}
                        <Receipt
                            sale={{
                                ...data,
                                items: [
                                    ...soldItems.map(i => ({ ...i, type: 'Sell' })),
                                    ...returnItems.map(i => ({ ...i, type: 'Return' })),
                                ],
                            }}
                            products={products}
                        />

                        <PrimaryButton
                            type="submit"
                            disabled={loading || soldItems.length === 0}
                            loading={loading}
                            className="px-8"
                        >
                            {loading ? 'Memproses...' : 'Selesaikan Transaksi'}
                        </PrimaryButton>
                    </div>
                </div>

            </form>
        </AuthenticatedLayout>
    );
}
