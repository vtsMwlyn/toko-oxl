import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import Table from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

import Show from './Show';
import CreateEdit from './CreateEdit';
import Delete from './Delete';
import Pagination from '@/Components/Pagination';

export default function Index({ customers }) {
    const [isViewing,  setIsViewing]  = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing,  setIsEditing]  = useState(null);
    const [isDeleting, setIsDeleting] = useState(null);
    const [search,     setSearch]     = useState('');

    const reload = useCallback(() => {
        router.reload({ only: ['customers'], preserveScroll: true, preserveState: true });
    }, []);

    // Keep the open customer popup in sync when customers prop refreshes
    useEffect(() => {
        if (isViewing) {
            const updated = customers.data.find(c => c.id === isViewing.id);
            if (updated) setIsViewing(updated);
        }
    }, [customers]);

    useEffect(() => {
        const id = setInterval(reload, 3000);
        document.addEventListener('visibilitychange', reload);
        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', reload);
        };
    }, [reload]);

    const filtered = customers.data.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone ?? '').includes(search)
    );

    return (
        <AuthenticatedLayout title="Pelanggan">
            <Head title="Pelanggan" />

            <div className="w-full flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <PrimaryButton icon={<Plus className="size-4" />} type="button" onClick={() => setIsCreating(true)}>
                    Tambah Pelanggan
                </PrimaryButton>
                <TextInput
                    placeholder="Cari nama atau telepon..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full sm:w-auto"
                />
            </div>

            <Table
                isEmpty={filtered.length === 0}
                headers={['Nama', 'Telepon', 'Alamat', 'Catatan', 'Aksi']}
                className="mt-4"
            >
                {filtered.map((customer, index) => (
                    <tr key={index} className="hover:bg-slate-200">
                        <td className="font-medium">{customer.name}</td>
                        <td>{customer.phone || <span className="text-slate-400">—</span>}</td>
                        <td className="max-w-xs truncate">{customer.address || <span className="text-slate-400">—</span>}</td>
                        <td className="max-w-xs truncate">{customer.notes || <span className="text-slate-400">—</span>}</td>
                        <td>
                            <div className="flex gap-2 items-center">
                                <PrimaryButton
                                    styled={false}
                                    className="text-emerald-600"
                                    icon={<Eye className="size-4" />}
                                    type="button"
                                    onClick={() => setIsViewing(customer)}
                                />
                                <PrimaryButton
                                    styled={false}
                                    className="text-emerald-600"
                                    icon={<Pencil className="size-4" />}
                                    type="button"
                                    onClick={() => setIsEditing(customer)}
                                />
                                <PrimaryButton
                                    styled={false}
                                    className="text-emerald-600"
                                    icon={<Trash2 className="size-4" />}
                                    type="button"
                                    onClick={() => setIsDeleting(customer)}
                                />
                            </div>
                        </td>
                    </tr>
                ))}
            </Table>

            <Pagination paginator={customers} />

            {isViewing && (
                <Show
                    isOpen={!!isViewing}
                    onClose={() => setIsViewing(null)}
                    customer={isViewing}
                    sales={isViewing.sales ?? []}
                    totalOmzet={isViewing.total_omzet ?? 0}
                    totalSales={isViewing.total_sales ?? 0}
                />
            )}
            {isCreating && (
                <CreateEdit mode="Create" isOpen={isCreating} onClose={() => setIsCreating(false)} />
            )}
            {isEditing && (
                <CreateEdit mode="Edit" isOpen={!!isEditing} onClose={() => setIsEditing(null)} customer={isEditing} />
            )}
            {isDeleting && (
                <Delete isOpen={!!isDeleting} onClose={() => setIsDeleting(null)} customer={isDeleting} />
            )}
        </AuthenticatedLayout>
    );
}
