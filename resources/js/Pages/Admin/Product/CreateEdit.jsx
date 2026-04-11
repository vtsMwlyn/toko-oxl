import { router } from "@inertiajs/react"
import { useState } from "react"
import { useForm } from "@inertiajs/react"
import { Check } from "lucide-react"

import Popup from "@/Components/Popup"
import InputLabel from "@/Components/InputLabel"
import TextInput from "@/Components/TextInput"
import InputError from "@/Components/InputError"
import PrimaryButton from "@/Components/PrimaryButton"

export default function CreateEdit({ mode, isOpen, onClose, product }){
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { data, setData, errors, setError } = useForm({
        name: product?.name || '',
        variant: product?.variant || '',
        price: product?.price || '',
        stock: product?.stock || '',
    });

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...data,
        }

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
            onFinish: () => setLoading(false)
        }

        if(mode === 'Create'){
            router.post(route('admin.product.store'), payload, afterSubmission);
        }
        else {
            router.post(route('admin.product.update', { product: product?.id }), payload, afterSubmission);
        }

    };

    return (
        <Popup title={mode === 'Create' ? 'Tambah Produk Baru' : 'Ubah Data Produk'} isOpen={isOpen} onClose={onClose} className="max-w-lg">
            {success ? (
                <p className="font-bold text-xl flex items-center gap-2 text-green-600">
                    <div className="h-6 w-6 flex items-center justify-center rounded bg-green-500">
                        <Check className="text-emerald-100" />
                    </div>
                    Berhasil {mode === 'Create' ? 'menambahkan produk baru!' : 'memperbaharui data produk!'}
                </p>
            ) : (
                <form onSubmit={submit} className="w-full flex flex-col">
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

                    <div className="w-full grid mb-4 gap-1">
                        <InputLabel htmlFor="variant" value="Varian" />
                        <TextInput
                            id="variant"
                            name="variant"
                            value={data.variant}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('variant', e.target.value)}
                        />
                        <InputError message={errors.variant} className="mt-2" />
                    </div>

                    <div className="w-full grid mb-4 gap-1">
                        <InputLabel htmlFor="price" value="Harga Jual" />
                        <TextInput
                            id="price"
                            name="price"
                            value={data.price}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('price', e.target.value)}
                        />
                        <InputError message={errors.price} className="mt-2" />
                    </div>

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

                    <div className="w-full flex justify-center mt-4">
                        <PrimaryButton type="submit" disabled={loading} className="w-40">{mode === 'Create' ? (!loading ? 'Tambah' : 'Menambahkan...') : (!loading ? 'Simpan' : 'Menyimpan...')}</PrimaryButton>
                    </div>
                </form>
            )}
        </Popup>
    )
}
