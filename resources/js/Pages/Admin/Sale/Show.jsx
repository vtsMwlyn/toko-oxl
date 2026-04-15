import { Eye } from 'lucide-react';

import Popup from '@/Components/Popup';
import Table from '@/Components/Table';

import formatPrice from '@/Helpers/formatPrice';
import formatDate from '@/Helpers/formatDate';
import formatTime from '@/Helpers/formatTime';

const statusBadge = {
    draft: 'bg-amber-100 text-amber-700',
    fixed: 'bg-emerald-100 text-emerald-700',
};

function InfoRow({ label, value }) {
    return (
        <div className="grid gap-0.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
            <span className="text-sm text-slate-700">{value ?? <span className="text-slate-300 italic">—</span>}</span>
        </div>
    );
}

function ItemsTable({ items, products, emptyText }) {
    if (items.length === 0) {
        return (
            <p className="text-sm text-slate-400 italic py-2">{emptyText}</p>
        );
    }

    const sellTotal   = items.reduce((sum, i) => sum + (i.price - (i.discount ?? 0)) * i.qty, 0);

    return (
        <div>
            <Table
                isEmpty={false}
                headers={['Produk', 'Harga', 'Diskon', 'Qty', 'Subtotal']}
                disableHeight={true}
            >
                {items.map((item, index) => {
                    const product  = products.find(p => p.id === item.product_id);
                    const subtotal = (item.price - (item.discount ?? 0)) * item.qty;

                    return (
                        <tr key={index} className="hover:bg-slate-50">
                            <td>
                                <div>
                                    <p className="font-medium text-slate-700">{product?.name ?? '—'}</p>
                                    <p className="text-xs text-slate-400">{product?.code}{product?.variant ? ` · ${product.variant}` : ''}</p>
                                </div>
                            </td>
                            <td>{formatPrice(item.price)}</td>
                            <td>
                                {item.discount
                                    ? <span>{formatPrice(item.discount)}</span>
                                    : <span className="text-slate-300">—</span>
                                }
                            </td>
                            <td>{item.qty}</td>
                            <td className="font-medium">{formatPrice(subtotal)}</td>
                        </tr>
                    );
                })}

                <tr>
                    <td>Total</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                        <span className="font-semibold text-slate-700">{formatPrice(sellTotal)}</span>
                    </td>
                </tr>
            </Table>
        </div>
    );
}

export default function Show({ isOpen, onClose, sale, products }) {
    if (!sale) return null;

    const soldItems   = sale.items?.filter(i => i.type === 'Sell')   ?? [];
    const returnItems = sale.items?.filter(i => i.type === 'Return') ?? [];

    const soldTotal   = soldItems.reduce((sum, i)   => sum + (i.price - (i.discount ?? 0)) * i.qty, 0);
    const returnTotal = returnItems.reduce((sum, i) => sum + (i.price - (i.discount ?? 0)) * i.qty, 0);
    const grandTotal  = soldTotal - returnTotal;

    return (
        <Popup
            title="Detail Penjualan"
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-6xl"
        >
            {/* ── Sale header info ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
                <InfoRow label="Tanggal" value={formatDate(sale.date)} />
                <InfoRow label="Waktu"   value={formatTime(sale.time)} />
                <InfoRow label="Pelanggan" value={sale.customer_name} />
                <InfoRow
                    label="Status"
                    value={
                        <span className={`px-2 py-0.5 rounded-md text-sm font-medium capitalize ${statusBadge[sale.status] ?? statusBadge.draft}`}>
                            {sale.status}
                        </span>
                    }
                />

                <div className="grid gap-0.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Penjualan</span>
                    <span className="font-bold text-green-600">{formatPrice(soldTotal) ?? <span className="text-slate-300 italic">—</span>}</span>
                </div>
                <div className="grid gap-0.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Retur</span>
                    <span className="font-bold text-red-600">{formatPrice(returnTotal) ?? <span className="text-slate-300 italic">—</span>}</span>
                </div>
                <div className="grid gap-0.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total</span>
                    <span className="font-bold text-green-600">{formatPrice(grandTotal) ?? <span className="text-slate-300 italic">—</span>}</span>
                </div>
            </div>

            {/* ── Sold items ── */}
            <h2 className="font-bold text-emerald-700 mt-5 mb-2">Produk Terjual</h2>
            <ItemsTable
                items={soldItems}
                products={products}
                emptyText="Tidak ada produk terjual."
            />

            {/* ── Returned items ── */}
            <h2 className="font-bold text-emerald-700 mt-5 mb-2">Produk Retur</h2>
            <ItemsTable
                items={returnItems}
                products={products}
                emptyText="Tidak ada produk retur."
            />
        </Popup>
    );
}
