import { router } from '@inertiajs/react';
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import Popup from '@/Components/Popup';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function BatchDeleteByRange({ isOpen, onClose, customerName = null }) {
    const [from,    setFrom]    = useState('');
    const [to,      setTo]      = useState('');
    const [errors,  setErrors]  = useState({});
    const [loading, setLoading] = useState(false);

    function validate() {
        const e = {};
        if (!from) e.from = 'Tanggal awal wajib diisi.';
        if (!to)   e.to   = 'Tanggal akhir wajib diisi.';
        if (from && to && to < from) e.to = 'Tanggal akhir harus setelah tanggal awal.';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function submit(e) {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        router.delete(route('admin.sale.destroyByRange'), {
            data: { from, to, ...(customerName ? { customer_name: customerName } : {}) },
            preserveState: true,
            onSuccess: () => { onClose(); },
            onError: (serverErrors) => setErrors(serverErrors),
            onFinish: () => setLoading(false),
        });
    }

    return (
        <Popup title="Hapus Penjualan Berdasarkan Tanggal" isOpen={isOpen} onClose={onClose} className="max-w-md">
            <form onSubmit={submit} className="flex flex-col gap-4">

                <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">
                        {customerName
                            ? `Semua penjualan atas nama "${customerName}" dalam rentang tanggal ini akan dihapus permanen.`
                            : 'Semua penjualan dalam rentang tanggal ini akan dihapus permanen.'
                        }
                        {' '}Stok akan dikembalikan untuk transaksi yang sudah Fixed. Tindakan ini tidak dapat dibatalkan.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-1">
                        <InputLabel value="Dari Tanggal" />
                        <TextInput
                            type="date"
                            value={from}
                            onChange={e => setFrom(e.target.value)}
                            className="block w-full"
                        />
                        <InputError message={errors.from} />
                    </div>
                    <div className="grid gap-1">
                        <InputLabel value="Sampai Tanggal" />
                        <TextInput
                            type="date"
                            value={to}
                            onChange={e => setTo(e.target.value)}
                            className="block w-full"
                        />
                        <InputError message={errors.to} />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 mt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Batal
                    </button>
                    <PrimaryButton
                        type="submit"
                        disabled={loading}
                        loading={loading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {loading ? 'Menghapus...' : 'Hapus Semua'}
                    </PrimaryButton>
                </div>

            </form>
        </Popup>
    );
}
