import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart2, Search, FileDown } from 'lucide-react';

import ExportWithPercent from './ExportWithPercent';
import ExportSpecificProduct from './ExportSpecificProduct';

import Table from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import formatPrice from '@/Helpers/formatPrice';

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

function BarChart({ data }) {
    if (!data.length) return <p className="text-sm text-slate-400 italic py-8 text-center">Tidak ada data.</p>;

    const max = Math.max(...data.map(d => d.total), 1);

    return (
        <div className="flex items-end gap-1 h-40 w-full pt-2">
            {data.map((d, i) => {
                const pct = Math.max((d.total / max) * 100, d.total > 0 ? 3 : 0);
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative min-w-0">
                        <div className="absolute bottom-full mb-1 hidden group-hover:flex bg-slate-800 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap z-10 pointer-events-none">
                            {d.date}: {formatPrice(d.total)}
                        </div>
                        <div
                            className="w-full rounded-t-md bg-emerald-400 group-hover:bg-emerald-600 transition-colors cursor-default"
                            style={{ height: `${pct}%`, minHeight: d.total > 0 ? '3px' : '0' }}
                        />
                        <span className="text-[9px] text-slate-400 truncate w-full text-center leading-tight">
                            {d.date?.slice(5)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default function Index({ from, to, omzet_per_day, summary, variant_stats, products }) {
    const [dateFrom, setDateFrom] = useState(from);
    const [dateTo,   setDateTo]   = useState(to);
    const [search,   setSearch]   = useState('');

    const [exportType, setExportType] = useState(null);
    const [isExportingSpecificProduct, setIsExportingSpecificProduct] = useState(false);

    function handleFilter(e) {
        e.preventDefault();
        router.get(route('admin.report.index'), { from: dateFrom, to: dateTo }, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    const filteredStats = variant_stats.filter(p =>
        p.product_name.toLowerCase().includes(search.toLowerCase()) ||
        p.variant_name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AuthenticatedLayout title="Laporan">
            <Head title="Laporan" />

            {/* ── Date range filter ── */}
            <div className="w-full flex items-center justify-between">
                <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-3 mb-6">
                    <div className="grid gap-1">
                        <label className="text-xs font-medium text-slate-500">Dari</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <div className="grid gap-1">
                        <label className="text-xs font-medium text-slate-500">Sampai</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <PrimaryButton type="submit">Tampilkan</PrimaryButton>
                </form>

                <div className="flex items-center gap-2">
                    <PrimaryButton icon={<FileDown className="size-4" />} type="button" onClick={() => setExportType('product')}>
                        Export by Produk
                    </PrimaryButton>
                    <PrimaryButton icon={<FileDown className="size-4" />} type="button" onClick={() => setExportType('sale')}>
                        Export by Transaksi
                    </PrimaryButton>
                    <PrimaryButton icon={<FileDown className="size-4" />} type="button" onClick={() => setIsExportingSpecificProduct(true)}>
                        Export by Varian Spesifik
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
                    <span className="ml-2 text-xs font-normal text-slate-400">({from} s/d {to})</span>
                </h3>
                <BarChart data={omzet_per_day} />
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
                            className="bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none w-44"
                        />
                    </div>
                </div>

                <Table
                    isEmpty={filteredStats.length === 0}
                    headers={['Kode', 'Nama Produk', 'Varian', 'Terjual', 'Retur', 'Net Qty', 'Pendapatan']}
                    disableHeight={true}
                >
                    {filteredStats.map((p, index) => (
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
            </div>

            {isExportingSpecificProduct && (
                <ExportSpecificProduct isOpen={isExportingSpecificProduct} onClose={() => setIsExportingSpecificProduct(false)} products={products} from={dateFrom} to={dateTo} />
            )}
            {exportType && (
                <ExportWithPercent type={exportType} onClose={() => setExportType(null)} from={dateFrom} to={dateTo} />
            )}
        </AuthenticatedLayout>
    );
}
