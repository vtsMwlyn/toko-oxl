import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Plus, Eye, Pencil, Trash2, X, Image } from 'lucide-react';
import { useState } from 'react';

import Table from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

import Show from './Show';
import CreateEdit from './CreateEdit';
import Delete from './Delete';

import { formatPrice } from '@/Helpers/formatPrice';

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

// ── Product image thumbnail ───────────────────────────────────────────────────
function ProductImage({ src, name, onClick }) {
    if (!src) {
        return (
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-300 text-[10px] font-medium select-none">
                <Image />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={name}
            onClick={onClick}
            className="w-10 h-10 rounded-lg object-cover border border-emerald-100 cursor-zoom-in hover:opacity-80 hover:scale-105 transition-all duration-150"
        />
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Index({ products }) {
    const [isCreating, setIsCreating] = useState(false);
    const [isShowing, setIsShowing] = useState(null);
    const [isEditing, setIsEditing] = useState(null);
    const [isDeleting, setIsDeleting] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const [search, setSearch] = useState('');

    return (
        <AuthenticatedLayout title="Daftar Produk">
            <Head title="Product" />

            {/* Full-screen image preview */}
            {previewImage && (
                <ImagePreview src={previewImage} onClose={() => setPreviewImage(null)} />
            )}

            <div className="w-full flex justify-between items-center">
                <PrimaryButton icon={<Plus className="size-4" />} type="button" onClick={() => setIsCreating(true)}>
                    Tambah Produk
                </PrimaryButton>
                <TextInput onInput={(e) => setSearch(e.target.value)} placeholder="Cari produk..." />
            </div>

            <Table
                isEmpty={products.length === 0}
                headers={['Foto', 'Kode', 'Nama', 'Varian', 'Stok', 'Harga Jual', 'Aksi']}
                className="mt-4"
            >
                {products.filter(
                    p => `${p.name} ${p.variant}`.toLowerCase().includes(search.toLowerCase())
                ).map((product, index) => (
                    <tr key={index} className="hover:bg-slate-200">
                        <td>
                            <ProductImage
                                src={product.image_url}
                                name={product.name}
                                onClick={() => product.image_url && setPreviewImage(product.image_url)}
                            />
                        </td>
                        <td>{product.code}</td>
                        <td>{product.name}</td>
                        <td>{product.variant}</td>
                        <td>{product.stock}</td>
                        <td>
                            <div className="w-full grid">
                                <p>{formatPrice(product.normal_price)}</p>
                                <p className="text-emerald-100 bg-emerald-600 font-bold text-[8pt] w-fit rounded-full px-1">{formatPrice(product.customer_price)}</p>
                            </div>
                        </td>
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
                                    onClick={() => setIsEditing(product.id)}
                                />
                                <PrimaryButton
                                    styled={false}
                                    className="text-emerald-600"
                                    icon={<Trash2 className="size-4" />}
                                    type="button"
                                    onClick={() => setIsDeleting(product.id)}
                                />
                            </div>
                        </td>
                    </tr>
                ))}
            </Table>

            {isCreating && (
                <CreateEdit
                    mode="Create" isOpen={isCreating} onClose={() => setIsCreating(false)}
                />
            )}
            {isShowing && (
                <Show
                    isOpen={!!isShowing} onClose={() => setIsShowing(false)}
                    product={products.find(p => p.id === isShowing)}
                />
            )}
            {isEditing && (
                <CreateEdit
                    mode="Edit" isOpen={!!isEditing} onClose={() => setIsEditing(null)}
                    product={products.find(p => p.id === isEditing)}
                />
            )}
            {isDeleting && (
                <Delete
                    isOpen={!!isDeleting} onClose={() => setIsDeleting(null)}
                    product={products.find(p => p.id === isDeleting)}
                />
            )}
        </AuthenticatedLayout>
    );
}
