import { router } from '@inertiajs/react';
import { useState } from 'react';

import Popup from '@/Components/Popup';
import PrimaryButton from '@/Components/PrimaryButton';
import OperationSuccess from '@/Components/OperationSuccess';

export default function Delete({ isOpen, onClose, customer }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);

        router.delete(route('admin.customer.destroy', { customer: customer.id }), {
            preserveState: true,
            onSuccess: () => {
                setSuccess(true);
                setTimeout(() => { onClose(); }, 500);
            },
            onFinish: () => setLoading(false),
        });
    };

    return (
        <Popup title="Hapus Pelanggan" isOpen={isOpen} onClose={onClose} className="max-w-lg">
            {success ? (
                <OperationSuccess type="Delete" message="Data pelanggan telah dihapus dari sistem." />
            ) : (
                <form onSubmit={submit} className="w-full flex flex-col">
                    <p>
                        Apakah Anda yakin ingin <strong>menghapus</strong> pelanggan <strong>{customer?.name}</strong>?
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="w-full flex justify-center mt-4">
                        <PrimaryButton type="submit" disabled={loading} loading={loading} className="w-40">
                            {!loading ? 'Konfirmasi' : 'Menghapus...'}
                        </PrimaryButton>
                    </div>
                </form>
            )}
        </Popup>
    );
}
