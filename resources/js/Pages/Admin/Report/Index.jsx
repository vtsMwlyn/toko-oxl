import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, BarChart2, Search, FileDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
    Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Filler);

import ExportWithPercent from './ExportWithPercent';
import ExportSpecificProduct from './ExportSpecificProduct';

import Table from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import formatPrice from '@/Helpers/formatPrice';
import formatDate from '@/Helpers/formatDate';

function SummaryCard({ label, value, icon: Icon, color = 'emerald' }) {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600',
        blue:    'bg-blue-50 text-blue-600',
        amber:   'bg-amber-50 text-amber-600',
    };
    return (
        <div className="bg-white rounded-2xl border border-emerald-100 p-5 flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-xl font-bold text-slate-800">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
        </div>
    );
}

const shortPrice = (val) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}jt`;
    if (val >= 1_000)     return `${(val / 1_000).toFixed(0)}rb`;
    return String(val);
};

function OmzetChart({ data }) {
    if (!data.length) return <p className="text-sm text-slate-400 italic py-8 text-center">Tidak ada data.</p>;

    const chartData = {
        labels: data.map(d => d.date?.slice(5) ?? d.date),
        datasets: [{
            data: data.map(d => d.total || null),
            borderColor: '#059669',
            backgroundColor: 'rgba(52, 211, 153, 0.15)',
            borderWidth: 2,
            pointRadius: data.length > 30 ? 0 : 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#059669',
            pointBorderColor: '#fff',
            pointBorderWidth: 1.5,
            fill: true,
            tension: 0,
            spanGaps: false,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    title: ctx => ctx[0].label,
                    label: ctx => ' ' + formatPrice(ctx.parsed.y),
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 10 },
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 14,
                },
            },
            y: {
                grid: { color: '#f1f5f9' },
                border: { display: false },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 10 },
                    maxTicksLimit: 5,
                    callback: val => shortPrice(val),
                },
            },
        },
    };

    return (
        <div style={{ position: 'relative', height: '192px', width: '100%' }}>
            <Line data={chartData} options={options} />
        </div>
    );
}

export default function Index({ from, to, omzet_per_day, summary, variant_stats, products }) {
    const [dateFrom, setDateFrom] = useState(from);
    const [dateTo,   setDateTo]   = useState(to);
    const [search,   setSearch]   = useState('');

    const [exportType,               setExportType]               = useState(null);
    const [isExportingSpecificProduct, setIsExportingSpecificProduct] = useState(false);
    const [statsPage, setStatsPage] = useState(1);

    const reload = useCallback(() => {
        router.reload({ only: ['omzet_per_day', 'summary', 'variant_stats'], preserveScroll: true, preserveState: true });
    }, []);

    useEffect(() => {
        const id = setInterval(reload, 3000);
        document.addEventListener('visibilitychange', reload);
        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', reload);
        };
    }, [reload]);

    function handleFilter(e) {
        e.preventDefault();
        router.get(route('admin.report.index'), { from: dateFrom, to: dateTo }, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    useEffect(() => { setStatsPage(1); }, [search]);

    const filteredStats = variant_stats.filter(p =>
        p.product_name.toLowerCase().includes(search.toLowerCase()) ||
        p.variant_name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase())
    );

    const STATS_PER_PAGE = 20;
    const statsTotalPages = Math.ceil(filteredStats.length / STATS_PER_PAGE);
    const paginatedStats  = filteredStats.slice((statsPage - 1) * STATS_PER_PAGE, statsPage * STATS_PER_PAGE);

    return (
        <AuthenticatedLayout title="Laporan">
            <Head title="Laporan" />

            {/* ── Date range filter + export buttons ── */}
            <div className="w-full flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                <form onSubmit={handleFilter} className="flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="grid gap-1">
                        <label className="text-xs font-medium text-slate-500">Dari</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <div className="grid gap-1">
                        <label className="text-xs font-medium text-slate-500">Sampai</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <PrimaryButton type="submit">Tampilkan</PrimaryButton>
                </form>

                <div className="flex flex-wrap items-center gap-2">
                    <PrimaryButton icon={<FileDown className="size-4" />} type="button" onClick={() => setExportType('product')}>
                        Export by Produk
                    </PrimaryButton>
                    <PrimaryButton icon={<FileDown className="size-4" />} type="button" onClick={() => setExportType('sale')}>
                        Export by Transaksi
                    </PrimaryButton>
                    <PrimaryButton icon={<FileDown className="size-4" />} type="button" onClick={() => setIsExportingSpecificProduct(true)}>
                        Export Spesifik
                    </PrimaryButton>
                </div>
            </div>

            {/* ── Summary cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <SummaryCard label="Total Omzet"             value={formatPrice(summary.total_omzet)}   icon={TrendingUp} />
                <SummaryCard label="Jumlah Transaksi"        value={summary.total_sales}                icon={BarChart2}  />
                <SummaryCard label="Rata-rata per Transaksi" value={formatPrice(summary.average_omzet)} icon={TrendingUp} />
            </div>

            {/* ── Omzet chart ── */}
            <div className="bg-white rounded-2xl border border-emerald-100 p-5 mb-6">
                <h3 className="text-sm font-semibold text-emerald-900 mb-4">
                    Grafik Omzet Harian
                    <span className="ml-2 text-xs font-normal text-slate-400">({formatDate(from)} s/d {formatDate(to)})</span>
                </h3>
                <OmzetChart data={omzet_per_day} />
            </div>

            {/* ── Per-variant stats ── */}
            <div className="bg-white rounded-2xl border border-emerald-100 p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h3 className="text-sm font-semibold text-emerald-900">Statistik Per Varian Produk</h3>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                        <Search size={13} className="text-slate-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Cari produk atau varian..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none w-32 sm:w-44"
                        />
                    </div>
                </div>

                <Table
                    isEmpty={filteredStats.length === 0}
                    headers={['Kode', 'Nama Produk', 'Varian', 'Terjual', 'Retur', 'Net Qty', 'Pendapatan']}
                    disableHeight={true}
                >
                    {paginatedStats.map((p, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                            <td className="font-mono text-xs">{p.code}</td>
                            <td className="font-medium">{p.product_name}</td>
                            <td className="text-slate-400 text-sm">{p.variant_name}</td>
                            <td>
                                <span className="flex items-center gap-1 text-emerald-600">
                                    <TrendingUp size={12} /> {p.sell_qty}
                                </span>
                            </td>
                            <td>
                                {p.return_qty > 0 ? (
                                    <span className="flex items-center gap-1 text-red-400">
                                        <TrendingDown size={12} /> {p.return_qty}
                                    </span>
                                ) : (
                                    <span className="text-slate-300">—</span>
                                )}
                            </td>
                            <td>
                                <span className={`font-semibold ${p.net_qty > 0 ? 'text-slate-700' : 'text-red-400'}`}>
                                    {p.net_qty}
                                </span>
                            </td>
                            <td className="font-semibold text-emerald-700">{formatPrice(p.net_revenue)}</td>
                        </tr>
                    ))}
                </Table>

                {statsTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 px-1">
                        <p className="text-xs text-slate-400">
                            {(statsPage - 1) * STATS_PER_PAGE + 1}–{Math.min(statsPage * STATS_PER_PAGE, filteredStats.length)} dari {filteredStats.length} data
                        </p>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setStatsPage(p => Math.max(1, p - 1))} disabled={statsPage === 1}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs text-slate-600">{statsPage} / {statsTotalPages}</span>
                            <button type="button" onClick={() => setStatsPage(p => Math.min(statsTotalPages, p + 1))} disabled={statsPage === statsTotalPages}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Popups ── */}
            {isExportingSpecificProduct && (
                <ExportSpecificProduct
                    isOpen={isExportingSpecificProduct}
                    onClose={() => setIsExportingSpecificProduct(false)}
                    products={products}
                    from={dateFrom}
                    to={dateTo}
                />
            )}
            {exportType && (
                <ExportWithPercent
                    type={exportType}
                    onClose={() => setExportType(null)}
                    from={dateFrom}
                    to={dateTo}
                />
            )}
        </AuthenticatedLayout>
    );
}
