import { useState, useRef, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import { usePage } from '@inertiajs/react';

export default function Navbar({ title, onMenuClick }) {
    const { props } = usePage();
    const lowStock = props.low_stock_variants ?? [];

    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef  = useRef(null);

    useEffect(() => {
        if (!notifOpen) return;
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [notifOpen]);

    return (
        <header className="sticky top-0 z-10 px-4 md:px-6 h-14 flex items-center gap-4 bg-white border-b border-slate-100">

            {/* ── Hamburger (mobile only) ── */}
            <button
                onClick={onMenuClick}
                aria-label="Buka menu"
                className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors"
            >
                <Menu size={22} />
            </button>

            {/* ── Page title ── */}
            <h1 className="text-base font-semibold text-slate-800 truncate flex-1">
                {title}
            </h1>

            {/* ── Bell notification ── */}
            <div className="relative" ref={notifRef}>
                <button
                    onClick={() => setNotifOpen(p => !p)}
                    className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                    aria-label="Notifikasi stok"
                >
                    <Bell size={18} />
                    {lowStock.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                        </span>
                    )}
                </button>

                {notifOpen && (
                    <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-slate-100">
                            <p className="text-xs font-semibold text-slate-700">
                                {lowStock.length > 0
                                    ? `${lowStock.length} varian stok rendah`
                                    : 'Notifikasi Stok'}
                            </p>
                        </div>

                        {lowStock.length === 0 ? (
                            <p className="px-4 py-4 text-xs text-slate-400 italic text-center">
                                Semua stok aman.
                            </p>
                        ) : (
                            <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                                {lowStock.map(v => (
                                    <div key={v.id} className="flex justify-between items-center px-4 py-2.5">
                                        <div>
                                            <p className="text-xs font-medium text-slate-700">
                                                {v.product.name}{v.name ? ` — ${v.name}` : ''}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                Batas: {v.low_stock_warning}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-bold shrink-0 ml-3 ${v.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                                            {v.stock === 0 ? 'Habis' : `Sisa ${v.stock}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
