import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, X, Eye } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';

import Table from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import LowStockWarning from '@/Components/LowStockWarning';
import Pagination from '@/Components/Pagination';

import CreateEdit from './CreateEdit';
import Show from './Show';
import Delete from './Delete';
import StockWarningForm from './StockWarningForm';

import formatPrice from '@/Helpers/formatPrice';

function ImagePreview({ src, onClose }) {
    return (
        <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-black/40 rounded-full p-1.5"
            >
                <X size={22} />
            </button>
            <img
                src={src}
                alt="Preview produk"
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}

export default function Index({ products, low_stock_variants, search: initialSearch }) {
    const [search, setSearch] = useState(initialSearch ?? '');
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        const timer = setTimeout(() => {
            router.get(route('admin.product.index'), search ? { search } : {}, { preserveState: true, preserveScroll: true });
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    const [hoveredProductId, setHoveredProductId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isShowing, setIsShowing] = useState(null);
    const [isEditing, setIsEditing] = useState(null);
    const [isDeleting, setIsDeleting] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [isSettingWarning, setIsSettingWarning] = useState(false);

    const reload = useCallback(() => {
        router.reload({ only: ['products', 'low_stock_variants', 'stock_warning_threshold'], preserveScroll: true, preserveState: true });
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
        <AuthenticatedLayout title="Daftar Produk">
            <Head title="Product" />

            {previewImage && (
                <ImagePreview src={previewImage} onClose={() => setPreviewImage(null)} />
            )}

            {/* ── Low stock warning banner ── */}
            <LowStockWarning variants={low_stock_variants} />

            <div className="mt-4 w-full flex justify-between items-center">
                <div className="flex gap-2">
                    <PrimaryButton icon={<Plus className="size-4" />} type="button" onClick={() => setIsCreating(true)}>
                        Tambah Produk
                    </PrimaryButton>
                </div>
                <TextInput placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <Table
                isEmpty={products.data.length === 0}
                headers={['Nama', 'Varian', 'Stok', 'Harga Jual', 'Harga Langganan', 'Aksi']}
                className="mt-4"
            >
                {products.data.map((product) => {
                    const hasLowStock = product.variants.some(
                        v => v.low_stock_warning > 0 && v.stock <= v.low_stock_warning
                    );

                    return product.variants.map((variant, variantIndex) => {
                        const isFirst = variantIndex === 0;
                        const isLow   = variant.low_stock_warning > 0 && variant.stock <= variant.low_stock_warning;

                        return (
                            <tr
                                key={`${product.id}-${variant.id}`}
                                className={`${hoveredProductId === product.id ? 'bg-slate-200' : ''} ${!isFirst ? '[&_td]:border-t-0' : ''}`}
                                onMouseEnter={() => setHoveredProductId(product.id)}
                                onMouseLeave={() => setHoveredProductId(null)}
                            >
                                {isFirst && (
                                    <td rowSpan={product.variants.length} className="align-top">
                                        <div className="flex items-center gap-2">
                                            {product.name}
                                            {hasLowStock && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-600">
                                                    Stok Rendah
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                )}
                                <td className="text-slate-500">{variant.name || variant.code}</td>
                                <td className={isLow ? 'text-amber-600 font-medium' : ''}>
                                    {variant.stock}
                                </td>
                                {isFirst && (
                                    <>
                                        <td rowSpan={product.variants.length} className="align-top">{formatPrice(product.normal_price)}</td>
                                        <td rowSpan={product.variants.length} className="align-top">{formatPrice(product.customer_price)}</td>
                                        <td rowSpan={product.variants.length} className="align-top">
                                            <div className="flex gap-2 items-center">
                                                <PrimaryButton
                                                    styled={false} className="text-emerald-600"
                                                    icon={<Eye className="size-4" />} type="button"
                                                    onClick={() => setIsShowing(product.id)}
                                                />
                                                <PrimaryButton
                                                    styled={false} className="text-emerald-600"
                                                    icon={<Pencil className="size-4" />} type="button"
                                                    onClick={() => setIsEditing(product)}
                                                />
                                                <PrimaryButton
                                                    styled={false} className="text-emerald-600"
                                                    icon={<Trash2 className="size-4" />} type="button"
                                                    onClick={() => setIsDeleting(product)}
                                                />
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        );
                    });
                })}
            </Table>

            <Pagination paginator={products} />

            {isCreating && (
                <CreateEdit mode="Create" isOpen={isCreating} onClose={() => setIsCreating(false)} />
            )}
            {isShowing && (
                <Show
                    isOpen={!!isShowing} onClose={() => setIsShowing(false)}
                    product={products.data.find(p => p.id === isShowing)}
                />
            )}
            {isEditing && (
                <CreateEdit mode="Edit" isOpen={!!isEditing} onClose={() => setIsEditing(null)} product={isEditing} />
            )}
            {isDeleting && (
                <Delete isOpen={!!isDeleting} onClose={() => setIsDeleting(null)} product={isDeleting} />
            )}
            {isSettingWarning && (
                <StockWarningForm
                    isOpen={isSettingWarning}
                    onClose={() => setIsSettingWarning(false)}
                    threshold={stock_warning_threshold}
                />
            )}
        </AuthenticatedLayout>
    );
}
