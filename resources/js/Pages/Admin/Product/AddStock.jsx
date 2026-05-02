import { useState } from "react"
import { useForm } from "@inertiajs/react"

import Popup from "@/Components/Popup"
import InputLabel from "@/Components/InputLabel"
import TextInput from "@/Components/TextInput"
import InputError from "@/Components/InputError"
import PrimaryButton from "@/Components/PrimaryButton"
import OperationSuccess from "@/Components/OperationSuccess"

export default function AddStock({ isOpen, onClose, variant, product }) {
    const [success, setSuccess] = useState(false);

    const { data, setData, post, processing, errors, setError } = useForm({
        amount: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('admin.product.variant.add-stock', { variant: variant.id }), {
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
        });
    };

    return (
        <Popup
            title="Tambah Stok"
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-sm"
        >
            {success ? (
                <OperationSuccess
                    type="Edit"
                    message="Stok berhasil diperbarui!"
                />
            ) : (
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-600">
                        <p>{product.name} — {variant.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Stok saat ini: <span className="font-semibold text-slate-600">{variant.stock}</span></p>
                    </div>

                    <div className="grid gap-1">
                        <InputLabel htmlFor="amount" value="Jumlah Tambahan" />
                        <TextInput
                            id="amount"
                            type="number"
                            min="1"
                            value={data.amount}
                            className="block w-full"
                            onChange={(e) => setData('amount', e.target.value)}
                            autoFocus
                        />
                        <InputError message={errors.amount} />
                    </div>

                    {data.amount > 0 && (
                        <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100 text-sm">
                            <span className="text-slate-500">Stok setelah penambahan</span>
                            <span className="font-semibold text-emerald-700">{variant.stock + Number(data.amount)}</span>
                        </div>
                    )}

                    <div className="w-full flex justify-center mt-2">
                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                            loading={processing}
                            className="w-40"
                        >
                            {!processing ? 'Tambah Stok' : 'Menyimpan...'}
                        </PrimaryButton>
                    </div>
                </form>
            )}
        </Popup>
    );
}
