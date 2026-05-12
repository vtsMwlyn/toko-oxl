import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

import CreateEdit from './CreateEdit';
import Delete from './Delete';

import formatDate from '@/Helpers/formatDate';

export default function Index({ returns, products }) {
    const { auth } = usePage().props;

    const [isCreating, setIsCreating] = useState(false);
    const [isEditing,  setIsEditing]  = useState(null);
    const [isDeleting, setIsDeleting] = useState(null);

    const [search, setSearch] = useState('');

    const filtered = returns.filter(r => {
        const variant = r.variant;
        const product = variant?.product;
        const q       = search.toLowerCase();
        return (
            !q ||
            product?.name?.toLowerCase().includes(q) ||
            variant?.code?.toLowerCase().includes(q) ||
            variant?.name?.toLowerCase().includes(q) ||
            r.date?.includes(q)
        );
    });

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
                <TextInput
                    placeholder="Cari produk, kode, tanggal..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <Table
                isEmpty={filtered.length === 0}
                headers={['Tanggal', 'Produk', 'Kode', 'Qty', 'Aksi']}
            >
                {filtered.map((item) => {
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
