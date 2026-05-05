import { router } from '@inertiajs/react';
import { useState } from 'react';

import Popup from '@/Components/Popup';
import PrimaryButton from '@/Components/PrimaryButton';
import OperationSuccess from '@/Components/OperationSuccess';

import formatDate from '@/Helpers/formatDate';

export default function SetFixed({ isOpen, onClose, sale }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);

        router.post(
            route('sale.set-fixed', { sale: sale.id }), {}, {
                onSuccess: () => {
                    setSuccess(true);
                    setTimeout(() => {
                        onClose();
                        setTimeout(() => setSuccess(false), 300);
                    }, 500);
                },
                onFinish: () => setLoading(false),
            }
        );
    };

    return (
        <Popup title="Set Transaksi Penjualan ke Fixed" isOpen={isOpen} onClose={onClose} className="max-w-lg">
            {success ? (
                <OperationSuccess type="Edit" message="Data penjualan telah diubah statusnya menjadi Fixed." />
            ) : (
                <form onSubmit={submit} className="w-full flex flex-col">
                    <p>
                        Apakah Anda yakin ingin <strong>mengubah status</strong> penjualan
                        tanggal <strong>{formatDate(sale?.date)}</strong> atas nama <strong>{sale?.customer_name || 'tanpa nama'}</strong> dari <i>Draft</i> menjadi <i>Fixed</i>?
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="w-full flex justify-center mt-4">
                        <PrimaryButton type="submit" disabled={loading} loading={loading} className="w-40">
                            {!loading ? 'Konfirmasi' : 'Menyimpan...'}
                        </PrimaryButton>
                    </div>
                </form>
            )}
        </Popup>
    );
}
