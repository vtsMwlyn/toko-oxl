import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ShoppingBag, Users, TrendingUp, Receipt,
    ArrowRight, Package,
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
} from 'chart.js';

import formatPrice from '@/Helpers/formatPrice';
import formatDate from '@/Helpers/formatDate';
import formatTime from '@/Helpers/formatTime';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

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

const shortPrice = (val) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}jt`;
    if (val >= 1_000)     return `${(val / 1_000).toFixed(0)}rb`;
    return String(val);
};

function BarChart({ data }) {
    const chartData = {
        labels: data.map(d => d.label),
        datasets: [{
            data: data.map(d => d.total),
            backgroundColor: 'rgba(52, 211, 153, 0.75)',
            hoverBackgroundColor: '#059669',
            borderRadius: 5,
            borderSkipped: false,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: ctx => ' ' + formatPrice(ctx.parsed.y),
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: { color: '#94a3b8', font: { size: 10 } },
            },
            y: {
                grid: { color: '#f1f5f9' },
                border: { display: false },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 10 },
                    maxTicksLimit: 4,
                    callback: val => shortPrice(val),
                },
            },
        },
    };

    return (
        <div style={{ position: 'relative', flex: 1, minHeight: '100px', width: '100%' }}>
            <Bar data={chartData} options={options} />
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
                <p className="text-xs text-slate-400">{formatDate(sale.date)} · {formatTime(sale.time)}</p>
            </div>
            <span className="text-sm font-semibold text-emerald-700 shrink-0">{formatPrice(sale.total)}</span>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Dashboard({ stats, omzet_per_day, recent_sales, auth }) {
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
                <div className="lg:col-span-2 bg-white rounded-2xl border border-emerald-100 p-5 flex flex-col">
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
