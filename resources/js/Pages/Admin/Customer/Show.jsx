import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Phone, MapPin, FileText, ShoppingBag, TrendingUp } from 'lucide-react';

import Table from '@/Components/Table';
import formatPrice from '@/Helpers/formatPrice';

const statusBadge = {
    draft: 'bg-amber-100 text-amber-700',
    fixed: 'bg-emerald-100 text-emerald-700',
};

function InfoItem({ icon: Icon, label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={15} />
            </div>
            <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm text-slate-700">{value}</p>
            </div>
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4">
            <p className="text-xs text-emerald-500 mb-1">{label}</p>
            <p className="text-xl font-bold text-emerald-700">{value}</p>
        </div>
    );
}

export default function Show({ customer, sales, total_omzet, total_sales }) {
    return (
        <AuthenticatedLayout title="Detail Pelanggan">
            <Head title={customer.name} />

            {/* ── Back link ── */}
            <Link
                href={route('admin.customer.index')}
                className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:underline mb-4"
            >
                <ArrowLeft size={15} /> Kembali ke daftar pelanggan
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* ── Customer info card ── */}
                <div className="bg-white rounded-2xl border border-emerald-100 p-6 flex flex-col gap-4">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                            {customer.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-emerald-900">{customer.name}</h2>
                            <p className="text-xs text-emerald-500">Pelanggan Tetap</p>
                        </div>
                    </div>

                    <div className="h-px bg-emerald-50" />

                    {/* Info items */}
                    <div className="flex flex-col gap-3">
                        <InfoItem icon={Phone}    label="No. Telepon" value={customer.phone} />
                        <InfoItem icon={MapPin}    label="Alamat"      value={customer.address} />
                        <InfoItem icon={FileText}  label="Catatan"     value={customer.notes} />
                    </div>

                    {/* Stats */}
                    <div className="h-px bg-emerald-50" />
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard label="Total Transaksi" value={total_sales} />
                        <StatCard label="Total Belanja"   value={formatPrice(total_omzet)} />
                    </div>
                </div>

                {/* ── Purchase history ── */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-emerald-100 p-6">
                    <h3 className="text-sm font-bold text-emerald-900 mb-4 flex items-center gap-2">
                        <ShoppingBag size={16} className="text-emerald-500" />
                        Riwayat Pembelian
                    </h3>

                    <Table
                        isEmpty={sales.length === 0}
                        headers={['Tanggal', 'Waktu', 'Status', 'Total']}
                        disableHeight={true}
                    >
                        {sales.map((sale, index) => (
                            <tr key={index} className="hover:bg-slate-50">
                                <td>{sale.date}</td>
                                <td>{sale.time}</td>
                                <td>
                                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${statusBadge[sale.status] ?? statusBadge.draft}`}>
                                        {sale.status}
                                    </span>
                                </td>
                                <td className="font-semibold text-emerald-700">{formatPrice(sale.total)}</td>
                            </tr>
                        ))}
                    </Table>

                    {sales.length === 0 && (
                        <p className="text-sm text-slate-400 italic text-center py-6">
                            Belum ada riwayat pembelian untuk pelanggan ini.
                        </p>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
