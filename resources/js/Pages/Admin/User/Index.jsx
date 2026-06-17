import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';

import Table from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Pagination from '@/Components/Pagination';

import CreateEdit from './CreateEdit';
import Delete from './Delete';

const roleBadge = {
    Admin: 'bg-emerald-100 text-emerald-700',
    User:  'bg-slate-100 text-slate-600',
};

export default function Index({ users, search: initialSearch }) {
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing,  setIsEditing]  = useState(null);
    const [isDeleting, setIsDeleting] = useState(null);
    const [search,     setSearch]     = useState(initialSearch ?? '');
    const isFirstRender  = useRef(true);
    const searchPending  = useRef(false);

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        searchPending.current = true;
        const timer = setTimeout(() => {
            router.get(route('admin.user.index'), search ? { search } : {}, { preserveState: true, preserveScroll: true });
            searchPending.current = false;
        }, 500);
        return () => { clearTimeout(timer); searchPending.current = false; };
    }, [search]);

    const reload = useCallback(() => {
        if (searchPending.current) return;
        router.reload({ only: ['users'], preserveScroll: true, preserveState: true });
    }, []);

    useEffect(() => {
        const id = setInterval(reload, 3000);
        document.addEventListener('visibilitychange', reload);
        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', reload);
        };
    }, [reload]);

    return (
        <AuthenticatedLayout title="Daftar Pengguna">
            <Head title="Pengguna" />

            <div className="w-full flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <PrimaryButton icon={<Plus className="size-4" />} type="button" onClick={() => setIsCreating(true)}>
                    Tambah Pengguna
                </PrimaryButton>
                <TextInput placeholder="Cari pengguna..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-auto" />
            </div>

            <Table
                isEmpty={users.data.length === 0}
                headers={['Nama', 'Email', 'Role', 'Aksi']}
                className="mt-4"
            >
                {users.data.map((user, index) => (
                    <tr key={index} className="hover:bg-slate-200">
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${roleBadge[user.role] ?? roleBadge.User}`}>
                                {user.role}
                            </span>
                        </td>
                        <td>
                            <div className="flex gap-2 items-center">
                                <PrimaryButton
                                    styled={false}
                                    className="text-emerald-600"
                                    icon={<Pencil className="size-4" />}
                                    type="button"
                                    onClick={() => setIsEditing(user)}
                                />
                                <PrimaryButton
                                    styled={false}
                                    className="text-emerald-600"
                                    icon={<Trash2 className="size-4" />}
                                    type="button"
                                    onClick={() => setIsDeleting(user)}
                                />
                            </div>
                        </td>
                    </tr>
                ))}
            </Table>
            <Pagination paginator={users} search={search} />

            {isCreating && (
                <CreateEdit mode="Create" isOpen={isCreating} onClose={() => setIsCreating(false)} />
            )}
            {isEditing && (
                <CreateEdit mode="Edit" isOpen={!!isEditing} onClose={() => setIsEditing(null)} user={isEditing} />
            )}
            {isDeleting && (
                <Delete isOpen={!!isDeleting} onClose={() => setIsDeleting(null)} user={isDeleting} />
            )}
        </AuthenticatedLayout>
    );
}
