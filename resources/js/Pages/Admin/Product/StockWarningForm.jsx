import { useForm } from "@inertiajs/react"

import Popup from "@/Components/Popup"
import InputLabel from "@/Components/InputLabel"
import TextInput from "@/Components/TextInput"
import InputError from "@/Components/InputError"
import PrimaryButton from "@/Components/PrimaryButton"
import { useState } from "react"
import OperationSuccess from "@/Components/OperationSuccess"

export default function StockWarningForm({ isOpen, onClose, threshold }) {
    const [success, setSuccess] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        threshold: threshold ?? 0,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.product.stock_warning'), {
            onSuccess: () => {
                setSuccess(true);
                setTimeout(() => { setSuccess(false); onClose(); }, 500);
            },
        });
    };

    return (
        <Popup title="Pengaturan Peringatan Stok" isOpen={isOpen} onClose={onClose} className="max-w-sm">
            {success ? (
                <OperationSuccess type="Edit" message="Pengaturan stok berhasil disimpan!" />
            ) : (
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <p className="text-sm text-slate-500">
                        Sistem akan menampilkan peringatan jika stok varian produk mencapai atau di bawah angka ini. Isi 0 untuk menonaktifkan.
                    </p>

                    <div className="grid gap-1">
                        <InputLabel htmlFor="threshold" value="Batas Stok Minimum" />
                        <TextInput
                            id="threshold"
                            type="number"
                            min="0"
                            value={data.threshold}
                            className="block w-full"
                            onChange={(e) => setData('threshold', e.target.value)}
                            autoFocus
                        />
                        <InputError message={errors.threshold} />
                    </div>

                    <div className="w-full flex justify-center mt-2">
                        <PrimaryButton type="submit" disabled={processing} loading={processing} className="w-40">
                            {!processing ? 'Simpan' : 'Menyimpan...'}
                        </PrimaryButton>
                    </div>
                </form>
            )}
        </Popup>
    );
}
