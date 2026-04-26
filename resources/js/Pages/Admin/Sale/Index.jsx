import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

import Table from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

import Show from './Show';
import CreateEdit from './CreateEdit';
import Delete from './Delete';

import formatPrice from '@/Helpers/formatPrice';
import formatDate from '@/Helpers/formatDate';
import formatTime from '@/Helpers/formatTime';

const statusBadge = {
    Draft: 'bg-amber-100 text-amber-700',
    Fixed: 'bg-emerald-100 text-emerald-700',
};

export default function Index({ sales, products, customers }) {
    const [isViewing,  setIsViewing]  = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing,  setIsEditing]  = useState(null);
    const [isDeleting, setIsDeleting] = useState(null);

    return (
        <AuthenticatedLayout title="Penjualan">
            <Head title="Penjualan" />

            <div className="w-full flex justify-between items-center">
                <PrimaryButton icon={<Plus className="size-4" />} type="button" onClick={() => setIsCreating(true)}>
                    Tambah Penjualan
                </PrimaryButton>
                <TextInput placeholder="Cari penjualan..." />
            </div>

            <Table
                isEmpty={sales.length === 0}
                headers={['Tanggal', 'Waktu', 'Pelanggan', 'Status', 'Total', 'Aksi']}
                className="mt-4"
            >
                {sales.map((sale, index) => (
                    <tr key={index} className="hover:bg-slate-200">
                        <td>{formatDate(sale.date)}</td>
                        <td>{formatTime(sale.time)}</td>
                        <td>{sale.customer_name || <span className="text-slate-400 italic">—</span>}</td>
                        <td>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${statusBadge[sale.status] ?? statusBadge.draft}`}>
                                {sale.status}
                            </span>
                        </td>
                        <td>{formatPrice(sale.total)}</td>
                        <td>
                            <div className="flex gap-2 items-center">
                                <PrimaryButton
                                    styled={false} className="text-emerald-600"
                                    icon={<Eye className="size-4" />} type="button"
                                    onClick={() => setIsViewing(sale)}
                                />
                                <PrimaryButton
                                    styled={false} className="text-emerald-600"
                                    icon={<Pencil className="size-4" />} type="button"
                                    onClick={() => setIsEditing(sale)}
                                />
                                <PrimaryButton
                                    styled={false} className="text-emerald-600"
                                    icon={<Trash2 className="size-4" />} type="button"
                                    onClick={() => setIsDeleting(sale)}
                                />
                            </div>
                        </td>
                    </tr>
                ))}
            </Table>

            {isViewing && (
                <Show isOpen={!!isViewing} onClose={() => setIsViewing(null)} sale={isViewing} products={products} />
            )}
            {isCreating && (
                <CreateEdit mode="Create" isOpen={isCreating} onClose={() => setIsCreating(false)} products={products} customers={customers} />
            )}
            {isEditing && (
                <CreateEdit mode="Edit" isOpen={!!isEditing} onClose={() => setIsEditing(null)} sale={isEditing} products={products} customers={customers} />
            )}
            {isDeleting && (
                <Delete isOpen={!!isDeleting} onClose={() => setIsDeleting(null)} sale={isDeleting} />
            )}
        </AuthenticatedLayout>
    );
}
