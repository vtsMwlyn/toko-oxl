import { router } from '@inertiajs/react';
import { useState } from 'react';

import Popup from '@/Components/Popup';
import PrimaryButton from '@/Components/PrimaryButton';
import PrintReceipt from '@/Pages/PrintReceipt';

import formatDate from '@/Helpers/formatDate';

export default function SetFixed({ isOpen, onClose, sale, products }) {
    const [loading,    setLoading]    = useState(false);
    const [success,    setSuccess]    = useState(false);
    const [hasPrinted, setHasPrinted] = useState(false);

    // The fixed sale we pass to PrintReceipt — status must reflect the new state
    const fixedSale = { ...sale, status: 'Fixed' };

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);

        router.post(
            route('sale.set-fixed', { sale: sale.id }), {}, {
                onSuccess: () => setSuccess(true),
                onFinish:  () => setLoading(false),
            }
        );
    };

    // Block closing only after the action succeeded and before the receipt is printed
    const handleClose = success && !hasPrinted ? undefined : onClose;

    return (
        <Popup
            title="Set Transaksi Penjualan ke Fixed"
            isOpen={isOpen}
            onClose={handleClose}
            className="max-w-lg"
        >
            {success ? (
                <div className="flex flex-col items-center gap-4 py-2">
                    {/* ── Status ── */}
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>

                    <div className="text-center">
                        <p className="font-semibold text-slate-800">Status berhasil diubah ke Fixed!</p>
                        <p className="text-sm text-slate-500 mt-1">
                            Cetak struk terlebih dahulu sebelum menutup jendela ini.
                        </p>
                    </div>

                    {/* ── Print button ── */}
                    <PrintReceipt
                        sale={fixedSale}
                        products={products}
                        onPrinted={() => setHasPrinted(true)}
                    />

                    {/* ── Close (only unlocked after printing) ── */}
                    <button
                        type="button"
                        disabled={!hasPrinted}
                        onClick={onClose}
                        className="text-sm text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        {hasPrinted ? 'Tutup' : 'Tutup (cetak struk dulu)'}
                    </button>
                </div>
            ) : (
                <form onSubmit={submit} className="w-full flex flex-col">
                    <p>
                        Apakah Anda yakin ingin <strong>mengubah status</strong> penjualan
                        tanggal <strong>{formatDate(sale?.date)}</strong> atas nama{' '}
                        <strong>{sale?.customer_name || 'tanpa nama'}</strong> dari <i>Draft</i> menjadi <i>Fixed</i>?
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
