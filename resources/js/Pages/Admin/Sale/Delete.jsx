import { router } from '@inertiajs/react';
import { useState } from 'react';

import Popup from '@/Components/Popup';
import PrimaryButton from '@/Components/PrimaryButton';
import OperationSuccess from '@/Components/OperationSuccess';

import formatDate from '@/Helpers/formatDate';

export default function Delete({ isOpen, onClose, sale }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [preserveStock, setPreserveStock] = useState(true);

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);

        router.delete(route('admin.sale.destroy', { sale: sale.id }), {
            data: { preserve_stock: preserveStock },
            preserveState: true,
            onSuccess: () => {
                setSuccess(true);
                setTimeout(() => { onClose(); }, 500);
            },
            onFinish: () => setLoading(false),
        });
    };

    return (
        <Popup title="Hapus Penjualan" isOpen={isOpen} onClose={onClose} className="max-w-lg">
            {success ? (
                <OperationSuccess type="Delete" message="Data penjualan telah dihapus dari sistem." />
            ) : (
                <form onSubmit={submit} className="w-full flex flex-col">
                    <p>
                        Apakah Anda yakin ingin <strong>menghapus</strong> penjualan
                        tanggal <strong>{formatDate(sale?.date)}</strong> atas nama <strong>{sale?.customer_name || 'tanpa nama'}</strong>?
                        Tindakan ini tidak dapat dibatalkan.
                    </p>

                    <label className="flex items-center gap-2 mt-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={preserveStock}
                            onChange={(e) => setPreserveStock(e.target.checked)}
                            className="rounded border-slate-300 text-emerald-600 shadow-sm focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-700">Pertahankan jumlah stok varian yang terkait</span>
                    </label>

                    <div className="w-full flex justify-center mt-6">
                        <PrimaryButton type="submit" disabled={loading} loading={loading} className="w-40">
                            {!loading ? 'Konfirmasi' : 'Menghapus...'}
                        </PrimaryButton>
                    </div>
                </form>
            )}
        </Popup>
    );
}
