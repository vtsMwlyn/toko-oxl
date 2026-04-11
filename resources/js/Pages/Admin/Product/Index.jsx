import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import Table from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

import CreateEdit from './CreateEdit';
import Delete from './Delete';

import { formatPrice } from '@/Helpers/formatPrice';

export default function Index({ products }) {
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [isDeleting, setIsDeleting] = useState(null);

    console.log(isEditing)

    return (
        <AuthenticatedLayout title="Daftar Produk">
            <Head title="Product" />

            <div className="w-full flex justify-between items-center">
                <PrimaryButton icon={<Plus className="size-4"/>} type="button" onClick={() => setIsCreating(true)}>Tambah Produk</PrimaryButton>
                <TextInput placeholder="Cari produk..." />
            </div>

            <Table isEmpty={products.length === 0} headers={['Nama', 'Varian', 'Stok', 'Harga Jual', 'Aksi']} className="mt-4">
                {products.map((product, index) => (
                    <tr key={index} className='hover:bg-slate-200'>
                        <td>{product.name}</td>
                        <td>{product.variant}</td>
                        <td>{product.stock}</td>
                        <td>{formatPrice(product.price)}</td>
                        <td>
                            <div className="flex gap-2 items-center">
                                <PrimaryButton styled={false} className="text-emerald-600" icon={<Pencil className="size-4"/>} type="button" onClick={() => setIsEditing(product)}></PrimaryButton>
                                <PrimaryButton styled={false} className="text-emerald-600" icon={<Trash2 className="size-4"/>} type="button" onClick={() => setIsDeleting(product)}></PrimaryButton>
                            </div>
                        </td>
                    </tr>
                ))}
            </Table>

            {isCreating && <CreateEdit mode="Create" isOpen={isCreating} onClose={() => setIsCreating(false)} />}
            {isEditing && <CreateEdit mode="Edit" isOpen={!!isEditing} onClose={() => setIsEditing(null)} product={isEditing} />}
            {isDeleting && <Delete isOpen={!!isDeleting} onClose={() => setIsDeleting(null)} product={isDeleting} />}
        </AuthenticatedLayout>
    );
}
