import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';

import Table from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

import CreateEdit from './CreateEdit';
import Delete from './Delete';

export default function Index({ customers }) {
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing,  setIsEditing]  = useState(null);
    const [isDeleting, setIsDeleting] = useState(null);
    const [search,     setSearch]     = useState('');

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone ?? '').includes(search)
    );

    return (
        <AuthenticatedLayout title="Pelanggan">
            <Head title="Pelanggan" />

            <div className="w-full flex justify-between items-center">
                <PrimaryButton icon={<Plus className="size-4" />} type="button" onClick={() => setIsCreating(true)}>
                    Tambah Pelanggan
                </PrimaryButton>
                <TextInput
                    placeholder="Cari nama atau telepon..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
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
                                <Link href={route('admin.customer.show', { customer: customer.id })}>
                                    <PrimaryButton
                                        styled={false}
                                        className="text-emerald-600"
                                        icon={<Eye className="size-4" />}
                                        type="button"
                                    />
                                </Link>
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
