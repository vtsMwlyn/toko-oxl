import { useState } from 'react';
import Navbar  from '@/Layouts/partials/Navbar';
import Sidebar from '@/Layouts/partials/Sidebar';

export default function AuthenticatedLayout({ children, title = 'Toko OXL' }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex gap-2 h-screen overflow-hidden bg-slate-300 font-sans p-2">

            {/* ── Sidebar ── */}
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* ── Main column ── */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden rounded-lg bg-white">
                <Navbar
                    title={title}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto px-6 pb-4 pt-1 text-sm">
                    {children}
                </main>
            </div>
        </div>
    );
}
