import { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Landmark,
    X,
    LogOut,
    UserPen,
    ChevronUp,
    ShoppingBag,
    BarChart2,
    Users,
    ShoppingCart,
    Star
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard',  icon: LayoutDashboard, urlPrefix: '/dashboard',      href: route('dashboard') },
    { label: 'Kasir',      icon: ShoppingCart,    urlPrefix: '/cashier',        href: route('cashier.index') },
    { label: 'Produk',     icon: Landmark,        urlPrefix: '/admin/product',  href: route('admin.product.index') },
    { label: 'Penjualan',  icon: ShoppingBag,     urlPrefix: '/admin/sale',     href: route('admin.sale.index') },
    { label: 'Pelanggan',  icon: Star,            urlPrefix: '/admin/customer', href: route('admin.customer.index') },
    { label: 'Laporan',    icon: BarChart2,       urlPrefix: '/admin/report',   href: route('admin.report.index') },
    { label: 'Pengguna',   icon: Users,           urlPrefix: '/admin/user',     href: route('admin.user.index') },
];

export default function Sidebar({ open, onClose }) {
    const { url, props } = usePage();
    const { auth } = props;

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Filter nav items: Admin sees all, others see ONLY 'Kasir'
    const filteredNavItems = auth.user.role === 'Admin'
        ? navItems
        : navItems.filter(item => item.label === 'Kasir');

    // Close popover on outside click
    useEffect(() => {
        if (!menuOpen) return;
        function handleOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [menuOpen]);

    function handleLogout() {
        router.post(route('logout'));
    }

    // Initials from user name
    const initials = auth.user.name
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <>
            {/* ── Mobile overlay ── */}
            {open && (
                <div
                    aria-hidden="true"
                    className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* ── Panel ── */}
            <aside
                className={`
                    fixed top-0 left-0 z-30 h-full w-64 flex flex-col
                    bg-white rounded-lg
                    transition-transform duration-300 ease-in-out
                    ${open ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static lg:z-auto
                `}
            >
                {/* ── Brand ── */}
                <div className="flex items-center gap-3 px-6 py-5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M12 2C9 2 7 4 7 4S3 4 3 8c0 3 2 5 2 5H5l1 9h12l1-9h.03S20 11 20 8c0-4-4-4-4-4S15 2 12 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-emerald-900 leading-tight">Toko OXL</p>
                        <p className="text-[11px] text-emerald-600 leading-tight">Toko Perlengkapan Alat Muslim</p>
                    </div>

                    {/* Close button (mobile) */}
                    <button
                        onClick={onClose}
                        aria-label="Tutup menu"
                        className="ml-auto text-emerald-400 hover:text-emerald-700 lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ── Navigation links ── */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
                    {/* Render using the filtered array */}
                    {filteredNavItems.map(item => {
                        const active = url.startsWith(item.urlPrefix);
                        const NavIcon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                    transition-all duration-150 group
                                    ${active
                                        ? 'bg-emerald-100 text-emerald-900'
                                        : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600'
                                    }
                                `}
                            >
                                <NavIcon
                                    size={18}
                                    className={`transition-colors shrink-0 ${
                                        active
                                            ? 'text-emerald-900'
                                            : 'text-emerald-600 group-hover:text-emerald-600'
                                    }`}
                                />

                                {item.label}

                                {active && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── User card (bottom) ── */}
                <div className="p-3 relative" ref={menuRef}>

                    {/* ── Popover menu ── */}
                    {menuOpen && (
                        <div className="absolute bottom-full left-3 right-3 mb-1 bg-white rounded-xl border border-emerald-100 shadow-lg shadow-emerald-100/50 overflow-hidden">
                            <Link
                                href={route('profile.edit')}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
                                onClick={() => setMenuOpen(false)}
                            >
                                <UserPen size={16} className="text-emerald-500 shrink-0" />
                                Edit Profil
                            </Link>
                            <div className="h-px bg-emerald-50" />
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={16} className="shrink-0" />
                                Keluar
                            </button>
                        </div>
                    )}

                    {/* ── Trigger button ── */}
                    <button
                        onClick={() => setMenuOpen(prev => !prev)}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                            transition-colors group
                            ${menuOpen ? 'bg-emerald-50' : 'hover:bg-emerald-50'}
                        `}
                    >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {initials}
                        </div>

                        {/* Name & role */}
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-emerald-900 truncate">{auth.user.name}</p>
                            <p className="text-[11px] text-emerald-500 truncate">{auth.user.role}</p>
                        </div>

                        {/* Chevron */}
                        <ChevronUp
                            size={16}
                            className={`text-emerald-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>
            </aside>
        </>
    );
}
