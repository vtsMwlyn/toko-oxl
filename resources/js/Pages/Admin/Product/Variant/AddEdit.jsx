import { router } from "@inertiajs/react"
import { useState, useRef } from "react"
import { useForm } from "@inertiajs/react"
import { ImagePlus } from "lucide-react"

import Popup from "@/Components/Popup"
import InputLabel from "@/Components/InputLabel"
import TextInput from "@/Components/TextInput"
import InputError from "@/Components/InputError"
import PrimaryButton from "@/Components/PrimaryButton"
import OperationSuccess from "@/Components/OperationSuccess"

export default function AddEdit({ mode, isOpen, onClose, product, variant }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [preview, setPreview] = useState(variant?.image_url || null);
    const fileInputRef = useRef(null);

    const { data, setData, errors, setError } = useForm({
        name: variant?.name || '',
        code: variant?.code || '',
        stock: variant?.stock || 0,
        low_stock_warning: variant?.low_stock_warning || 0,
        image: null,
    });

    function handleImageChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setData('image', file);
        setPreview(URL.createObjectURL(file));
    }

    function clearImage() {
        setData('image', null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = new FormData();
        payload.append('name', data.name);
        payload.append('code', data.code);
        payload.append('stock', data.stock);
        payload.append('low_stock_warning', data.low_stock_warning);
        if (data.image) payload.append('image', data.image);

        const afterSubmission = {
            onSuccess: () => {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    onClose();
                }, 500);
            },
            onError: (serverErrors) => {
                Object.entries(serverErrors).forEach(([key, message]) => {
                    setError(key, message);
                });
            },
            onFinish: () => setLoading(false),
            // Required so Laravel receives multipart/form-data correctly
            forceFormData: true,
        };

        if (mode === 'Create') {
            router.post(route('admin.product.variant.store', { product: product?.id }), payload, afterSubmission);
        } else {
            router.post(route('admin.product.variant.update', { variant: variant?.id }), payload, afterSubmission);
        }
    };

    return (
        <Popup
            title={mode === 'Create' ? 'Tambah Produk Baru' : 'Ubah Data Produk'}
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-lg"
        >
            {success ? (
                <OperationSuccess type={mode} message={mode === 'Create' ? 'Berhasil menambahkan produk baru ke sistem.' : 'Berhasil memperbaharui data produk!'} />
            ) : (
                <form onSubmit={submit} className="w-full flex flex-col">

                    {/* ── Image upload ── */}
                    <div className="w-full grid mb-4 gap-1">
                        <InputLabel value="Foto Produk" />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />

                        {preview ? (
                            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-emerald-100 group">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-3 py-1.5 rounded-lg bg-white text-emerald-700 text-xs font-semibold hover:bg-emerald-50 transition-colors"
                                    >
                                        Ganti Foto
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="px-3 py-1.5 rounded-lg bg-white text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-36 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition-colors flex flex-col items-center justify-center gap-2 text-emerald-500"
                            >
                                <ImagePlus size={28} />
                                <span className="text-xs font-medium">Klik untuk unggah foto</span>
                                <span className="text-[11px] text-emerald-400">PNG, JPG, WEBP hingga 2MB</span>
                            </button>
                        )}

                        <InputError message={errors.image} className="mt-1" />
                    </div>

                    {/* ── Name ── */}
                    <div className="w-full grid mb-4 gap-1">
                        <InputLabel htmlFor="name" value="Nama" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    {/* ── Code ── */}
                    <div className="w-full grid mb-4 gap-1">
                        <InputLabel htmlFor="code" value="Kode" />
                        <TextInput
                            id="code"
                            name="code"
                            value={data.code}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('code', e.target.value)}
                        />
                        <InputError message={errors.code} className="mt-2" />
                    </div>

                    {/* ── Stock ── */}
                    <div className="w-full grid mb-4 gap-1">
                        <InputLabel htmlFor="stock" value="Stok" />
                        <TextInput
                            id="stock"
                            name="stock"
                            value={data.stock}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('stock', e.target.value)}
                        />
                        <InputError message={errors.stock} className="mt-2" />
                    </div>

                    {/* ── Low Stock Warning ── */}
                    <div className="w-full grid mb-4 gap-1">
                        <InputLabel htmlFor="low_stock_warning" value="Warning Low Stock" />
                        <TextInput
                            id="low_stock_warning"
                            name="low_stock_warning"
                            value={data.low_stock_warning}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('low_stock_warning', e.target.value)}
                        />
                        <InputError message={errors.low_stock_warning} className="mt-2" />
                    </div>

                    <div className="w-full flex justify-center mt-4">
                        <PrimaryButton
                            type="submit"
                            disabled={loading}
                            loading={loading}
                            className="w-40"
                        >
                            {mode === 'Create'
                                ? (!loading ? 'Tambah' : 'Menambahkan...')
                                : (!loading ? 'Simpan' : 'Menyimpan...')
                            }
                        </PrimaryButton>
                    </div>
                </form>
            )}
        </Popup>
    );
}
