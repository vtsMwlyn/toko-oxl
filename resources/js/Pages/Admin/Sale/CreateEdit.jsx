import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

import Popup from '@/Components/Popup';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import OperationSuccess from '@/Components/OperationSuccess';
import PrintReceipt from '@/Pages/PrintReceipt';
import Table from '@/Components/Table';
import SelectInput from '@/Components/Select';

import ItemAddEdit from './Item/AddEdit';
import ItemRemove from './Item/Remove';

import formatPrice from '@/Helpers/formatPrice';

function SectionTitle({ children }) {
    return <h2 className="font-bold text-emerald-700 mt-6 mb-2">{children}</h2>;
}

function computeTotal(items) {
    return items.reduce((sum, item) => {
        return sum + (item.price - (item.discount ?? 0)) * item.qty;
    }, 0);
}

export default function CreateEdit({ mode, isOpen, onClose, sale, products, customers }) {
    const { auth } = usePage().props;
    const isCashier          = auth?.user?.role !== 'Admin';
    const lockDateTimeFields = mode === 'Edit' && isCashier;
    const lockHeaderFields   = mode === 'Edit' && sale?.status === 'Fixed' && isCashier;

    const [loading,    setLoading]    = useState(false);
    const [success,    setSuccess]    = useState(false);
    const [becameFixed, setBecameFixed] = useState(false);
    const [hasPrinted,  setHasPrinted]  = useState(false);

    const [soldItems, setSoldItems] = useState(() =>
        (sale?.items?.filter(i => i.type === 'Sell') ?? [])
            .map(i => ({ ...i, _localId: i._localId ?? i.id }))
    );
    const [returnItems, setReturnItems] = useState(() =>
        (sale?.items?.filter(i => i.type === 'Return') ?? [])
            .map(i => ({ ...i, _localId: i._localId ?? i.id }))
    );

    const [itemPopup, setItemPopup] = useState(null);
    // shape: { type: 'Sell'|'Return', mode: 'Create'|'Edit'|'Remove', item?: object }

    const customerOptions = (customers ?? []).map(c => ({
        value: c.name,
        label: c.name,
        customer: c,
    }));

    const initialCustomerOption = sale?.customer_name
        ? { value: sale.customer_name, label: sale.customer_name }
        : null;

    const [customerOption, setCustomerOption] = useState(initialCustomerOption);

    const { data, setData, errors, setError } = useForm({
        date:          sale?.date          ?? new Date().toISOString().slice(0, 10),
        time:          sale?.time          ?? new Date().toTimeString().slice(0, 5),
        customer_name: sale?.customer_name ?? '',
        status:        sale?.status        ?? 'Draft',
    });

    function handleCustomerChange(option) {
        setCustomerOption(option);
        setData('customer_name', option?.value ?? '');
    }

    function handleItemSave(type, item) {
        const setter = type === 'Sell' ? setSoldItems : setReturnItems;
        setter(prev => {
            const exists = prev.some(i => i._localId === item._localId);
            if (exists) {
                return prev.map(i => i._localId === item._localId ? item : i);
            }
            return [...prev, { ...item, _localId: Date.now() }];
        });
    }

    function handleItemRemove(type, localId) {
        const setter = type === 'Sell' ? setSoldItems : setReturnItems;
        setter(prev => prev.filter(i => i._localId !== localId));
    }

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);

        const isTransitioningToFixed = mode === 'Edit' && sale?.status === 'Draft' && data.status === 'Fixed';

        const payload = {
            ...data,
            items: [
                ...soldItems.map(({ _localId, ...i })   => ({ ...i, type: 'Sell' })),
                ...returnItems.map(({ _localId, ...i }) => ({ ...i, type: 'Return' })),
            ],
        };

        const afterSubmission = {
            onSuccess: () => {
                if (isTransitioningToFixed) {
                    setBecameFixed(true);
                } else {
                    setSuccess(true);
                    setTimeout(() => { setSuccess(false); onClose(); }, 500);
                }
            },
            onError: (serverErrors) => {
                Object.entries(serverErrors).forEach(([key, message]) => setError(key, message));
            },
            onFinish: () => setLoading(false),
        };

        if (mode === 'Create') {
            router.post(route('admin.sale.store'), payload, afterSubmission);
        } else {
            router.post(route('sale.update', { sale: sale?.id }), payload, afterSubmission);
        }
    };

    // Total is based on sold items only — return items do not affect the total
    const soldTotal   = computeTotal(soldItems);
    const returnTotal = computeTotal(returnItems);
    const grandTotal  = soldTotal - returnTotal;

    return (
        <Popup
            title={mode === 'Create' ? 'Tambah Penjualan' : 'Ubah Penjualan'}
            isOpen={isOpen}
            onClose={becameFixed && !hasPrinted ? undefined : onClose}
            className="max-w-3xl"
        >
            {becameFixed ? (
                <div className="flex flex-col items-center gap-4 py-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-slate-800">Status berhasil diubah ke Fixed!</p>
                        <p className="text-sm text-slate-500 mt-1">
                            Cetak struk terlebih dahulu sebelum menutup jendela ini.
                        </p>
                    </div>
                    <PrintReceipt
                        sale={{ ...sale, ...data, status: 'Fixed', items: [
                            ...soldItems.map(({ _localId, ...i }) => ({ ...i, type: 'Sell' })),
                            ...returnItems.map(({ _localId, ...i }) => ({ ...i, type: 'Return' })),
                        ]}}
                        products={products}
                        onPrinted={() => setHasPrinted(true)}
                    />
                    <button
                        type="button"
                        disabled={!hasPrinted}
                        onClick={onClose}
                        className="text-sm text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        {hasPrinted ? 'Tutup' : 'Tutup (cetak struk dulu)'}
                    </button>
                </div>
            ) : success ? (
                <OperationSuccess
                    type={mode === 'Create' ? 'Create' : 'Edit'}
                    message={mode === 'Create' ? 'Penjualan berhasil ditambahkan.' : 'Penjualan berhasil diperbarui.'}
                />
            ) : (
                <form onSubmit={submit} className="w-full flex flex-col">

                    {/* ── Header fields ── */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1">
                            <InputLabel htmlFor="date" value="Tanggal" />
                            <TextInput
                                id="date" type="date" value={data.date}
                                className="block w-full"
                                onChange={(e) => setData('date', e.target.value)}
                                disabled={lockDateTimeFields}
                            />
                            <InputError message={errors.date} />
                        </div>

                        <div className="grid gap-1">
                            <InputLabel htmlFor="time" value="Waktu" />
                            <TextInput
                                id="time" type="time" value={data.time}
                                className="block w-full"
                                onChange={(e) => setData('time', e.target.value)}
                                disabled={lockDateTimeFields}
                            />
                            <InputError message={errors.time} />
                        </div>

                        <div className="grid gap-1">
                            <InputLabel value="Nama Pelanggan" required={false} />
                            <SelectInput
                                creatable
                                options={customerOptions}
                                value={customerOption}
                                onChange={handleCustomerChange}
                                onInputChange={(val, { action }) => {
                                    if (action === 'input-change') {
                                        setCustomerOption({ value: val, label: val });
                                        setData('customer_name', val);
                                    }
                                }}
                                isClearable
                                placeholder="Pilih pelanggan atau ketik nama..."
                                formatCreateLabel={(val) => `Gunakan nama: "${val}"`}
                                noOptionsMessage={() => 'Tidak ada pelanggan terdaftar'}
                            />
                            <InputError message={errors.customer_name} />
                        </div>

                        <div className="grid gap-1">
                            <InputLabel htmlFor="status" value="Status" />
                            <select
                                id="status" value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                disabled={lockHeaderFields}
                                className="block w-full border border-gray-300 rounded-md shadow-sm text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Fixed">Fixed</option>
                            </select>
                            <InputError message={errors.status} />
                        </div>
                    </div>

                    {/* ── Sold items ── */}
                    <SectionTitle>Daftar Produk Terjual</SectionTitle>
                    <ItemsTable
                        items={soldItems}
                        onEdit={(item)   => setItemPopup({ type: 'Sell',   mode: 'Edit',   item })}
                        onRemove={(item) => setItemPopup({ type: 'Sell',   mode: 'Remove', item })}
                        products={products}
                    />
                    <div className="flex justify-between items-center mt-2">
                        <PrimaryButton
                            icon={<Plus className="size-4" />} type="button"
                            onClick={() => setItemPopup({ type: 'Sell', mode: 'Create' })}
                        >
                            Tambah Produk
                        </PrimaryButton>
                        <p className="text-sm text-slate-500">
                            Subtotal: <span className="font-semibold text-slate-700">{formatPrice(soldTotal)}</span>
                        </p>
                    </div>

                    {/* ── Return items ── */}
                    <SectionTitle>Daftar Produk Retur</SectionTitle>
                    <ItemsTable
                        items={returnItems}
                        onEdit={(item)   => setItemPopup({ type: 'Return', mode: 'Edit',   item })}
                        onRemove={(item) => setItemPopup({ type: 'Return', mode: 'Remove', item })}
                        products={products}
                    />
                    <div className="flex justify-between items-center mt-2">
                        <PrimaryButton
                            icon={<Plus className="size-4" />} type="button"
                            onClick={() => setItemPopup({ type: 'Return', mode: 'Create' })}
                        >
                            Tambah Produk Retur
                        </PrimaryButton>
                        <p className="text-sm text-slate-500">
                            Subtotal Retur: <span className="font-semibold text-slate-700">{formatPrice(returnTotal)}</span>
                        </p>
                    </div>

                    {/* ── Grand total ── */}
                    <div className="mt-6 flex justify-end">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-6 py-3 text-right">
                            <p className="text-xs text-emerald-500 mb-0.5">Total Penjualan</p>
                            <p className="text-xl font-bold text-emerald-700">{formatPrice(grandTotal)}</p>
                        </div>
                    </div>

                    <div className="w-full flex justify-center mt-6">
                        <PrimaryButton type="submit" disabled={loading} loading={loading} className="w-40">
                            {mode === 'Create'
                                ? (!loading ? 'Simpan'   : 'Menyimpan...')
                                : (!loading ? 'Perbarui' : 'Memperbarui...')
                            }
                        </PrimaryButton>
                    </div>
                </form>
            )}

            {/* ── Nested item popups ── */}
            {itemPopup && itemPopup.mode !== 'Remove' && (
                <ItemAddEdit
                    mode={itemPopup.mode}
                    type={itemPopup.type}
                    isOpen={!!itemPopup}
                    item={itemPopup.item}
                    products={products}
                    customerName={data.customer_name}
                    onClose={() => setItemPopup(null)}
                    onSave={(item) => {
                        handleItemSave(itemPopup.type, item);
                        setItemPopup(null);
                    }}
                />
            )}
            {itemPopup && itemPopup.mode === 'Remove' && (
                <ItemRemove
                    isOpen={!!itemPopup}
                    item={itemPopup.item}
                    products={products}
                    onClose={() => setItemPopup(null)}
                    onConfirm={() => {
                        handleItemRemove(itemPopup.type, itemPopup.item._localId);
                        setItemPopup(null);
                    }}
                />
            )}
        </Popup>
    );
}

// ── Items table ───────────────────────────────────────────────────────────────
function ItemsTable({ items, onEdit, onRemove, products }) {
    return (
        <Table
            isEmpty={items.length === 0}
            headers={['Kode', 'Nama', 'Harga', 'Diskon', 'Qty', 'Subtotal', 'Aksi']}
            disableHeight={true}
        >
            {items.map((item, index) => {
                const variant  = products.flatMap(p => p.variants).find(v => v.id === item.variant_id);
                const product  = products.find(p => p.id === variant?.product_id);
                const subtotal = (item.price - (item.discount ?? 0)) * item.qty;
                return (
                    <tr key={item._localId ?? index} className="hover:bg-slate-100">
                        <td>{variant?.code ?? '—'}</td>
                        <td>{product ? `${product.name}${variant?.name ? ` (${variant.name})` : ''}` : '—'}</td>
                        <td>{formatPrice(item.price)}</td>
                        <td>{item.discount ? formatPrice(item.discount) : <span className="text-slate-400">—</span>}</td>
                        <td>{item.qty}</td>
                        <td>{formatPrice(subtotal)}</td>
                        <td>
                            <div className="flex gap-2 items-center">
                                <PrimaryButton
                                    styled={false} className="text-emerald-600"
                                    icon={<Pencil className="size-4" />} type="button"
                                    onClick={() => onEdit(item)}
                                />
                                <PrimaryButton
                                    styled={false} className="text-emerald-600"
                                    icon={<Trash2 className="size-4" />} type="button"
                                    onClick={() => onRemove(item)}
                                />
                            </div>
                        </td>
                    </tr>
                );
            })}
        </Table>
    );
}
