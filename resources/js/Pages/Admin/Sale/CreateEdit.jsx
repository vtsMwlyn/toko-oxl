import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

import Popup from '@/Components/Popup';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import OperationSuccess from '@/Components/OperationSuccess';
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
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [soldItems, setSoldItems] = useState(() =>
        (sale?.items ?? []).map(i => ({ ...i, _localId: i._localId ?? i.id }))
    );

    const [itemPopup, setItemPopup] = useState(null);
    // shape: { mode: 'Create'|'Edit'|'Remove', item?: object }

    // Build customer options for the creatable select
    const customerOptions = (customers ?? []).map(c => ({
        value: c.name,
        label: c.name,
        customer: c,
    }));

    // Resolve the initial select value when editing an existing sale
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

    function handleItemSave(item) {
        setSoldItems(prev => {
            const exists = prev.some(i => i._localId === item._localId);
            if (exists) {
                return prev.map(i => i._localId === item._localId ? item : i);
            }
            return [...prev, { ...item, _localId: Date.now() }];
        });
    }

    function handleItemRemove(localId) {
        setSoldItems(prev => prev.filter(i => i._localId !== localId));
    }

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...data,
            items: soldItems.map(({ _localId, ...i }) => i),
        };

        const afterSubmission = {
            onSuccess: () => {
                setSuccess(true);
                setTimeout(() => { setSuccess(false); onClose(); }, 500);
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

    const total = computeTotal(soldItems);

    return (
        <Popup
            title={mode === 'Create' ? 'Tambah Penjualan' : 'Ubah Penjualan'}
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-3xl"
        >
            {success ? (
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
                            />
                            <InputError message={errors.date} />
                        </div>

                        <div className="grid gap-1">
                            <InputLabel htmlFor="time" value="Waktu" />
                            <TextInput
                                id="time" type="time" value={data.time}
                                className="block w-full"
                                onChange={(e) => setData('time', e.target.value)}
                            />
                            <InputError message={errors.time} />
                        </div>

                        <div className="grid gap-1">
                            <InputLabel value="Nama Pelanggan" required={false}/>
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
                                className="block w-full border border-gray-300 rounded-md shadow-sm text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
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
                        onEdit={(item)   => setItemPopup({ mode: 'Edit',   item })}
                        onRemove={(item) => setItemPopup({ mode: 'Remove', item })}
                        products={products}
                    />
                    <div className="flex justify-between items-center mt-2">
                        <PrimaryButton
                            icon={<Plus className="size-4" />} type="button"
                            onClick={() => setItemPopup({ mode: 'Create' })}
                        >
                            Tambah Produk
                        </PrimaryButton>
                        <p className="text-sm text-slate-500">
                            Total: <span className="font-semibold text-slate-700">{formatPrice(total)}</span>
                        </p>
                    </div>

                    {/* ── Total ── */}
                    <div className="mt-6 flex justify-end">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-6 py-3 text-right">
                            <p className="text-xs text-emerald-500 mb-0.5">Total Penjualan</p>
                            <p className="text-xl font-bold text-emerald-700">{formatPrice(total)}</p>
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
                    isOpen={!!itemPopup}
                    item={itemPopup.item}
                    products={products}
                    customerName={data.customer_name}
                    onClose={() => setItemPopup(null)}
                    onSave={(item) => {
                        handleItemSave(item);
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
                        handleItemRemove(itemPopup.item._localId);
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
