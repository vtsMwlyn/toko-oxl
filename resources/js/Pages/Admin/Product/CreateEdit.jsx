import { useState } from "react"
import { useForm } from "@inertiajs/react"

import Popup from "@/Components/Popup"
import InputLabel from "@/Components/InputLabel"
import TextInput from "@/Components/TextInput"
import InputError from "@/Components/InputError"
import PrimaryButton from "@/Components/PrimaryButton"
import OperationSuccess from "@/Components/OperationSuccess"

export default function CreateEdit({ mode, isOpen, onClose, product }) {
    const [success, setSuccess] = useState(false);

    const { data, setData, post, processing, errors, setError } = useForm({
        name: product?.name || '',
        normal_price: product?.normal_price || '',
        customer_price: product?.customer_price || '',
    });

    const submit = (e) => {
        e.preventDefault();

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
        };

        if (mode === 'Create') {
            post(route('admin.product.store'), afterSubmission);
        } else {
            post(route('admin.product.update', { product: product?.id }), afterSubmission);
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

                    <div className="w-full grid grid-cols-2 mb-4 gap-4">
                        {/* ── Normal Price ── */}
                        <div className="w-full grid gap-1">
                            <InputLabel htmlFor="normal_price" value="Harga Normal" />
                            <TextInput
                                id="normal_price"
                                name="normal_price"
                                value={data.normal_price}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('normal_price', e.target.value)}
                            />
                            <InputError message={errors.normal_price} className="mt-2" />
                        </div>

                        {/* ── Customer Price ── */}
                        <div className="w-full grid gap-1">
                            <InputLabel htmlFor="customer_price" value="Harga Khusus Langganan" />
                            <TextInput
                                id="customer_price"
                                name="customer_price"
                                value={data.customer_price}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('customer_price', e.target.value)}
                            />
                            <InputError message={errors.customer_price} className="mt-2" />
                        </div>
                    </div>

                    <div className="w-full flex justify-center mt-4">
                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                            loading={processing}
                            className="w-40"
                        >
                            {mode === 'Create'
                                ? (!processing ? 'Tambah' : 'Menambahkan...')
                                : (!processing ? 'Simpan' : 'Menyimpan...')
                            }
                        </PrimaryButton>
                    </div>
                </form>
            )}
        </Popup>
    );
}
