import { Phone, MapPin, FileText, ShoppingBag } from 'lucide-react';

import Popup from '@/Components/Popup';
import Table from '@/Components/Table';
import SectionTitle from '@/Components/SectionTitle';
import formatPrice from '@/Helpers/formatPrice';

const statusBadge = {
    Draft: 'bg-amber-100 text-amber-700',
    Fixed: 'bg-emerald-100 text-emerald-700',
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

export default function Show({ isOpen, onClose, customer, sales, totalOmzet, totalSales }) {
    if (!customer) return null;

    return (
        <Popup title="Detail Pelanggan" isOpen={isOpen} onClose={onClose} className="max-w-2xl">

            {/* ── Customer info ── */}
            <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {customer.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                    <h2 className="text-lg font-bold text-emerald-900">{customer.name}</h2>
                    <p className="text-xs text-emerald-500">Pelanggan Tetap</p>
                </div>
            </div>

            <div className="flex flex-col gap-3 mb-4">
                <InfoItem icon={Phone}   label="No. Telepon" value={customer.phone} />
                <InfoItem icon={MapPin}  label="Alamat"      value={customer.address} />
                <InfoItem icon={FileText} label="Catatan"    value={customer.notes} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
                <StatCard label="Total Transaksi" value={totalSales} />
                <StatCard label="Total Belanja"   value={formatPrice(totalOmzet)} />
            </div>

            {/* ── Purchase history ── */}
            <SectionTitle>
                <span className="flex items-center gap-2">
                    <ShoppingBag size={15} className="text-emerald-500" />
                    Riwayat Pembelian
                </span>
            </SectionTitle>

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
                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusBadge[sale.status] ?? statusBadge.Fixed}`}>
                                {sale.status}
                            </span>
                        </td>
                        <td className="font-semibold text-emerald-700">{formatPrice(sale.total)}</td>
                    </tr>
                ))}
            </Table>
        </Popup>
    );
}
