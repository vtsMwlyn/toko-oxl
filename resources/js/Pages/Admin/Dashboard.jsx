import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ShoppingBag, Users, TrendingUp, Receipt,
    ArrowRight, Package,
} from 'lucide-react';
import LowStockWarning from '@/Components/LowStockWarning';

import formatPrice from '@/Helpers/formatPrice';

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, sub }) {
    return (
        <div className="bg-white rounded-2xl border border-emerald-100 p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Icon size={20} />
            </div>
            <div className="min-w-0">
                <p className="text-xl font-bold text-emerald-900 truncate">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                {sub && <p className="text-xs text-emerald-500 mt-1">{sub}</p>}
            </div>
        </div>
    );
}

// ── Simple bar chart (pure CSS, no lib) ───────────────────────────────────────
function BarChart({ data }) {
    const max = Math.max(...data.map(d => d.total), 1);

    return (
        <div className="flex items-end gap-1.5 h-28 w-full">
            {data.map((d, i) => {
                const pct = Math.max((d.total / max) * 100, d.total > 0 ? 4 : 0);
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 hidden group-hover:flex bg-slate-800 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap z-10">
                            {formatPrice(d.total)}
                        </div>
                        <div
                            className="w-full rounded-t-md bg-emerald-400 group-hover:bg-emerald-600 transition-colors"
                            style={{ height: `${pct}%`, minHeight: d.total > 0 ? '4px' : '0' }}
                        />
                        <span className="text-[9px] text-slate-400 truncate w-full text-center">{d.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ── Recent sale row ───────────────────────────────────────────────────────────
function SaleRow({ sale }) {
    const initials = sale.customer_name
        ? sale.customer_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : '—';

    return (
        <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-semibold shrink-0">
                {initials}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                    {sale.customer_name || <span className="text-slate-400 italic">Tanpa nama</span>}
                </p>
                <p className="text-xs text-slate-400">{sale.date} · {sale.time}</p>
            </div>
            <span className="text-sm font-semibold text-emerald-700 shrink-0">{formatPrice(sale.total)}</span>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Dashboard({ stats, omzet_per_day, recent_sales, auth, stock_warning_threshold }) {
    return (
        <AuthenticatedLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* ── Welcome banner ── */}
            <div className="rounded-2xl bg-emerald-600 px-6 py-5 mb-6 flex items-center justify-between">
                <div>
                    <p className="text-emerald-200 text-sm">Assalamu'alaikum 👋</p>
                    <h2 className="text-white text-lg font-bold mt-0.5">{auth?.user?.name}</h2>
                    <p className="text-emerald-100 text-xs mt-1">Toko OXL — Toko Perlengkapan Alat Muslim</p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-emerald-200 text-xs">Transaksi hari ini</p>
                    <p className="text-white text-3xl font-bold">{stats.sales_today}</p>
                    <p className="text-emerald-200 text-xs mt-0.5">penjualan lunas</p>
                </div>
            </div>

            {/* ── Low stock warning ── */}
            {/* {low_stock_variants.length > 0 && (
                <div className="mb-6">
                    <LowStockWarning variants={low_stock_variants} threshold={stock_warning_threshold} />
                </div>
            )} */}

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    label="Omzet Hari Ini"
                    value={formatPrice(stats.omzet_today)}
                    icon={TrendingUp}
                />
                <StatCard
                    label="Omzet Bulan Ini"
                    value={formatPrice(stats.omzet_this_month)}
                    icon={Receipt}
                />
                <StatCard
                    label="Total Produk"
                    value={stats.total_products}
                    icon={Package}
                />
                <StatCard
                    label="Total Pengguna"
                    value={stats.total_users}
                    icon={Users}
                />
            </div>

            {/* ── Main content row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Omzet 7 hari terakhir */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-emerald-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-emerald-900">Omzet 7 Hari Terakhir</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Penjualan lunas saja</p>
                        </div>
                        <Link
                            href={route('admin.report.index')}
                            className="text-xs text-emerald-500 hover:underline flex items-center gap-1"
                        >
                            Laporan lengkap <ArrowRight size={12} />
                        </Link>
                    </div>
                    <BarChart data={omzet_per_day} />
                </div>

                {/* Penjualan terakhir */}
                <div className="bg-white rounded-2xl border border-emerald-100 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-emerald-900">Penjualan Terakhir</h3>
                        <Link
                            href={route('sale.index')}
                            className="text-xs text-emerald-500 hover:underline flex items-center gap-1"
                        >
                            Semua <ArrowRight size={12} />
                        </Link>
                    </div>
                    {recent_sales.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4 text-center">Belum ada penjualan.</p>
                    ) : (
                        recent_sales.map(sale => <SaleRow key={sale.id} sale={sale} />)
                    )}
                </div>

            </div>

            {/* ── Quick links ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                {[
                    { label: 'Kelola Produk',     href: route('admin.product.index'), icon: Package,     desc: 'Tambah, ubah, hapus produk' },
                    { label: 'Kelola Penjualan',  href: route('sale.index'),    icon: ShoppingBag, desc: 'Catat dan kelola transaksi' },
                    { label: 'Laporan',           href: route('admin.report.index'),  icon: TrendingUp,  desc: 'Omzet dan statistik produk' },
                ].map(({ label, href, icon: Icon, desc }) => (
                    <Link
                        key={label}
                        href={href}
                        className="flex items-center gap-4 bg-white rounded-2xl border border-emerald-100 px-5 py-4 hover:border-emerald-300 hover:shadow-sm transition-all group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                            <Icon size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-700">{label}</p>
                            <p className="text-xs text-slate-400">{desc}</p>
                        </div>
                        <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </Link>
                ))}
            </div>
        </AuthenticatedLayout>
    );
}
