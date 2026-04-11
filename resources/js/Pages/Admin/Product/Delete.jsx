import { router } from "@inertiajs/react"
import { useState } from "react"
import { useForm } from "@inertiajs/react"
import { Check } from "lucide-react"

import Popup from "@/Components/Popup"
import InputLabel from "@/Components/InputLabel"
import TextInput from "@/Components/TextInput"
import InputError from "@/Components/InputError"
import PrimaryButton from "@/Components/PrimaryButton"

export default function Del({ isOpen, onClose, product }){
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);

        router.delete(route('admin.product.destroy', { product: product.id }), {
            preserveState: true,
            onSuccess: () => {
                setSuccess(true);

                setTimeout(() => {
                onClose();
                }, 500);
            },
            onFinish: () => setLoading(false)
        });
    };

    return (
        <Popup title="Hapus Data Produk" isOpen={isOpen} onClose={onClose} className="max-w-lg">
            {success ? (
                <p className="font-bold text-xl flex items-center gap-2 text-green-600">
                    <div className="h-6 w-6 flex items-center justify-center rounded bg-green-500">
                        <Check className="text-emerald-100" />
                    </div>
                    Berhasil menghapus data produk!
                </p>
            ) : (
                <form onSubmit={submit} className="w-full flex flex-col">
                    <p>Apakah Anda yakin ingin <strong>menghapus</strong> produk {product.name} {product.variant}?</p>

                    <div className="w-full flex justify-center mt-4">
                        <PrimaryButton type="submit" disabled={loading} className="w-40">{!loading ? 'Konfirmasi' : 'Menghapus...'}</PrimaryButton>
                    </div>
                </form>
            )}
        </Popup>
    )
}
