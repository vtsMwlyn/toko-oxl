import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Plus, Pencil, Trash2, X, FileDown, Eye } from 'lucide-react';
import { useState } from 'react';

import Table from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

import CreateEdit from './CreateEdit';
import Show from './Show';
import Delete from './Delete';
import PrintAllBarcode from './PrintAllBarcode';

import formatPrice from '@/Helpers/formatPrice';

// ── Full-screen image preview overlay ─────────────────────────────────────────
function ImagePreview({ src, onClose }) {
    return (
        <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-black/40 rounded-full p-1.5"
            >
                <X size={22} />
            </button>

            {/* Image — stop propagation so clicking the image itself doesn't close */}
            <img
                src={src}
                alt="Preview produk"
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Index({ products }) {
    const [isCreating, setIsCreating] = useState(false);
    const [isShowing, setIsShowing] = useState(null);
    const [isEditing, setIsEditing] = useState(null);
    const [isDeleting, setIsDeleting] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    return (
        <AuthenticatedLayout title="Daftar Produk">
            <Head title="Product" />

            {/* Full-screen image preview */}
            {previewImage && (
                <ImagePreview src={previewImage} onClose={() => setPreviewImage(null)} />
            )}

            <div className="w-full flex justify-between items-center">
                <div className="flex gap-2">
                    <PrimaryButton icon={<Plus className="size-4" />} type="button" onClick={() => setIsCreating(true)}>
                        Tambah Produk
                    </PrimaryButton>
                    {/* <PrintAllBarcode products={products} formatPrice={formatPrice} /> */}
                    <a href={route('admin.product.export')}>
                        <PrimaryButton icon={<FileDown className="size-4" />} type="button">
                            Export Excel
                        </PrimaryButton>
                    </a>
                </div>
                <TextInput placeholder="Cari produk..." />
            </div>

            <Table
                isEmpty={products.length === 0}
                headers={['Nama', 'Total Varian', 'Total Stok', 'Harga Jual', 'Harga Langganan', 'Aksi']}
                className="mt-4"
            >
                {products.map((product, index) => {
                    let totalStock = 0;
                    product.variants.forEach(v => totalStock += v.stock);
                    return (
                        <tr key={index} className="hover:bg-slate-200">
                            <td>{product.name}</td>
                            <td>{product.variants.length}</td>
                            <td>{totalStock}</td>
                            <td>{formatPrice(product.normal_price)}</td>
                            <td>{formatPrice(product.customer_price)}</td>
                            <td>
                                <div className="flex gap-2 items-center">
                                    <PrimaryButton
                                        styled={false}
                                        className="text-emerald-600"
                                        icon={<Eye className="size-4" />}
                                        type="button"
                                        onClick={() => setIsShowing(product.id)}
                                    />
                                    <PrimaryButton
                                        styled={false}
                                        className="text-emerald-600"
                                        icon={<Pencil className="size-4" />}
                                        type="button"
                                        onClick={() => setIsEditing(product)}
                                    />
                                    <PrimaryButton
                                        styled={false}
                                        className="text-emerald-600"
                                        icon={<Trash2 className="size-4" />}
                                        type="button"
                                        onClick={() => setIsDeleting(product)}
                                    />
                                </div>
                            </td>
                        </tr>
                    )
                })}
            </Table>

            {isCreating && (
                <CreateEdit mode="Create" isOpen={isCreating} onClose={() => setIsCreating(false)} />
            )}
            {isShowing && (
                <Show
                    isOpen={!!isShowing} onClose={() => setIsShowing(false)}
                    product={products.find(p => p.id === isShowing)}
                />
            )}
            {isEditing && (
                <CreateEdit mode="Edit" isOpen={!!isEditing} onClose={() => setIsEditing(null)} product={isEditing} />
            )}
            {isDeleting && (
                <Delete isOpen={!!isDeleting} onClose={() => setIsDeleting(null)} product={isDeleting} />
            )}
        </AuthenticatedLayout>
    );
}
