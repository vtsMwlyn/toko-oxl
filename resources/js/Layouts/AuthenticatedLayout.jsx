import { useState, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import Navbar  from '@/Layouts/partials/Navbar';
import Sidebar from '@/Layouts/partials/Sidebar';
import Toast  from '@/Components/Toast';
import LoadingOverlay from '@/Components/LoadingOverlay';

export default function AuthenticatedLayout({ children, title = 'Toko OXL' }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toasts, setToasts] = useState([]);
    const { props } = usePage();
    const flashSuccess = props.flash?.success;

    useEffect(() => {
        if (!flashSuccess) return;
        setToasts(prev => [...prev, { id: Date.now(), text: flashSuccess }]);
    }, [flashSuccess]);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">

            {/* ── Sidebar ── */}
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* ── Main column ── */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar
                    title={title}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto px-6 pb-6 pt-4 text-sm">
                    {children}
                </main>
            </div>

            <Toast messages={toasts} onDismiss={dismiss} />
            <LoadingOverlay />
        </div>
    );
}
