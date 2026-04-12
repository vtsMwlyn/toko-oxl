import { router } from "@inertiajs/react"
import { useState } from "react"
import { useForm } from "@inertiajs/react"

import Popup from "@/Components/Popup"
import InputLabel from "@/Components/InputLabel"
import TextInput from "@/Components/TextInput"
import InputError from "@/Components/InputError"
import PrimaryButton from "@/Components/PrimaryButton"
import OperationSuccess from "@/Components/OperationSuccess"

export default function AddEdit({ mode, isOpen, onClose, product, discount }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { data, setData, errors, setError } = useForm({
        min_qty: (discount?.min_qty === 0 ? '0' : discount?.min_qty) || '',
        normal_price: discount?.normal_price || '',
        customer_price: discount?.customer_price || '',
    });


    const submit = (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...data
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
            onFinish: () => setLoading(false),
        };

        if (mode === 'Create') {
            router.post(route('admin.product.discount.store', { product: product?.id }), payload, afterSubmission);
        } else {
            router.post(route('admin.product.discount.update', { discount: discount?.id }), payload, afterSubmission);
        }
    };

    return (
        <Popup
            title={mode === 'Create' ? 'Tambah Harga Spesial' : 'Ubah Data Harga Spesial'}
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-sm"
        >
            {success ? (
                <OperationSuccess type={mode} message={mode === 'Create' ? 'Berhasil menambahkan harga spesial ke produk.' : 'Berhasil memperbaharui harga spesial pada produk!'} />
            ) : (
                <form onSubmit={submit} className="w-full flex flex-col">
                    {/* ── Min. Qty ── */}
                    <div className="w-full grid mb-4 gap-1">
                        <InputLabel htmlFor="min_qty" value="Minimum Pembelian" />
                        <TextInput
                            id="min_qty"
                            name="min_qty"
                            value={data.min_qty}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('min_qty', e.target.value)}
                        />
                        <InputError message={errors.min_qty} className="mt-2" />
                    </div>

                    {/* ── Normal Price ── */}
                    <div className="w-full grid gap-1 mb-4">
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
                    <div className="w-full grid gap-1 mb-4">
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
