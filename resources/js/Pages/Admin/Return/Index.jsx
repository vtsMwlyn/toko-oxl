import { useState, useEffect, useCallback } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Pagination from '@/Components/Pagination';

import CreateEdit from './CreateEdit';
import Delete from './Delete';

import formatDate from '@/Helpers/formatDate';

export default function Index({ returns, products, from: initialFrom, to: initialTo }) {
    const { auth } = usePage().props;

    const [isCreating, setIsCreating] = useState(false);
    const [isEditing,  setIsEditing]  = useState(null);
    const [isDeleting, setIsDeleting] = useState(null);

    const [dateFrom, setDateFrom] = useState(initialFrom ?? '');
    const [dateTo,   setDateTo]   = useState(initialTo   ?? '');

    useEffect(() => {
        setDateFrom(initialFrom ?? '');
        setDateTo(initialTo   ?? '');
    }, [initialFrom, initialTo]);

    const reload = useCallback(() => {
        router.reload({ only: ['returns', 'products'], preserveScroll: true, preserveState: true });
    }, []);

    useEffect(() => {
        const id = setInterval(reload, 5000);
        document.addEventListener('visibilitychange', reload);
        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', reload);
        };
    }, [reload]);

    return (
        <AuthenticatedLayout title="Retur Produk">
            <Head title="Retur Produk" />

            <div className="w-full flex justify-between items-center mb-4">
                {auth.user.role === 'Admin' ? (
                    <PrimaryButton icon={<Plus className="size-4" />} type="button" onClick={() => setIsCreating(true)}>
                        Tambah Retur
                    </PrimaryButton>
                ) : (
                    <div />
                )}

                {/* ── Date range filter ── */}
                <div className="flex items-center gap-2">
                    <TextInput
                        type="date"
                        value={dateFrom}
                        onChange={e => {
                            setDateFrom(e.target.value);
                            router.get(route('admin.return.index'), { from: e.target.value, ...(dateTo ? { to: dateTo } : {}) }, { preserveState: true, preserveScroll: true });
                        }}
                        className="w-40"
                    />
                    <span className="text-slate-400 text-sm">—</span>
                    <TextInput
                        type="date"
                        value={dateTo}
                        onChange={e => {
                            setDateTo(e.target.value);
                            router.get(route('admin.return.index'), { ...(dateFrom ? { from: dateFrom } : {}), to: e.target.value }, { preserveState: true, preserveScroll: true });
                        }}
                        className="w-40"
                    />
                    {(dateFrom || dateTo) && (
                        <button
                            type="button"
                            onClick={() => {
                                setDateFrom('');
                                setDateTo('');
                                router.get(route('admin.return.index'), {}, { preserveState: true, preserveScroll: true });
                            }}
                            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            <Table
                isEmpty={returns.data.length === 0}
                headers={['Tanggal', 'Produk', 'Kode', 'Qty', 'Aksi']}
            >
                {returns.data.map((item) => {
                    const variant = item.variant;
                    const product = variant?.product;
                    return (
                        <tr key={item.id} className="hover:bg-slate-100">
                            <td>{formatDate(item.date)}</td>
                            <td>
                                <p className="font-medium">{product?.name ?? '—'}</p>
                                {variant?.name && <p className="text-xs text-slate-400">{variant.name}</p>}
                            </td>
                            <td className="font-mono text-sm">{variant?.code ?? '—'}</td>
                            <td>{item.qty}</td>
                            <td>
                                {auth.user.role === 'Admin' && (
                                    <div className="flex gap-2 items-center">
                                        <PrimaryButton
                                            styled={false} className="text-emerald-600"
                                            icon={<Pencil className="size-4" />} type="button"
                                            onClick={() => setIsEditing(item)}
                                        />
                                        <PrimaryButton
                                            styled={false} className="text-emerald-600"
                                            icon={<Trash2 className="size-4" />} type="button"
                                            onClick={() => setIsDeleting(item)}
                                        />
                                    </div>
                                )}
                            </td>
                        </tr>
                    );
                })}
            </Table>

            <Pagination paginator={returns} />

            {isCreating && (
                <CreateEdit
                    mode="Create"
                    isOpen={isCreating}
                    onClose={() => setIsCreating(false)}
                    products={products}
                />
            )}
            {isEditing && (
                <CreateEdit
                    mode="Edit"
                    isOpen={!!isEditing}
                    onClose={() => setIsEditing(null)}
                    item={isEditing}
                    products={products}
                />
            )}
            {isDeleting && (
                <Delete
                    isOpen={!!isDeleting}
                    onClose={() => setIsDeleting(null)}
                    item={isDeleting}
                />
            )}
        </AuthenticatedLayout>
    );
}
