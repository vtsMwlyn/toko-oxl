import { router } from '@inertiajs/react';
import { useState } from 'react';

import Popup from '@/Components/Popup';
import PrimaryButton from '@/Components/PrimaryButton';

import formatDate from '@/Helpers/formatDate';

export default function SetDraft({ isOpen, onClose, sale }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);

        router.post(
            route('sale.set-draft', { sale: sale.id }), {}, {
                onSuccess: () => setSuccess(true),
                onFinish:  () => setLoading(false),
            }
        );
    };

    return (
        <Popup
            title="Kembalikan ke Draft"
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-lg"
        >
            {success ? (
                <div className="flex flex-col items-center gap-4 py-2">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-slate-800">Status berhasil dikembalikan ke Draft!</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            ) : (
                <form onSubmit={submit} className="w-full flex flex-col gap-4">
                    <p className="text-slate-700">
                        Apakah Anda yakin ingin <strong>mengembalikan status</strong> penjualan
                        tanggal <strong>{formatDate(sale?.date)}</strong> atas nama{' '}
                        <strong>{sale?.customer_name || 'tanpa nama'}</strong> dari <i>Fixed</i> menjadi <i>Draft</i>?
                    </p>
                    <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                        Stok produk dalam transaksi ini akan <strong>dikembalikan ke inventori</strong>.
                    </p>
                    <div className="w-full flex justify-center mt-2">
                        <PrimaryButton
                            type="submit"
                            disabled={loading}
                            loading={loading}
                            className="w-40 bg-amber-500 hover:bg-amber-600"
                        >
                            {!loading ? 'Konfirmasi' : 'Menyimpan...'}
                        </PrimaryButton>
                    </div>
                </form>
            )}
        </Popup>
    );
}
