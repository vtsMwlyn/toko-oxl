import Popup from '@/Components/Popup';
import Table from '@/Components/Table';
import PrintReceipt from '../../PrintReceipt';

import formatPrice from '@/Helpers/formatPrice';
import formatDate from '@/Helpers/formatDate';
import formatTime from '@/Helpers/formatTime';

const statusBadge = {
    Draft: 'bg-amber-100 text-amber-700',
    Fixed: 'bg-emerald-100 text-emerald-700',
};

function InfoRow({ label, value }) {
    return (
        <div className="grid gap-0.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
            <span className="text-sm text-slate-700">{value ?? <span className="text-slate-300 italic">—</span>}</span>
        </div>
    );
}

function ItemsTable({ items, emptyText }) {
    if (items.length === 0) {
        return (
            <p className="text-sm text-slate-400 italic py-2">{emptyText}</p>
        );
    }

    const total = items.reduce((sum, i) => sum + (i.price - (i.discount ?? 0)) * i.qty, 0);

    return (
        <div>
            <Table
                isEmpty={false}
                headers={['Produk', 'Harga', 'Diskon', 'Qty', 'Subtotal']}
                disableHeight={true}
            >
                {items.map((item, index) => {
                    const variant  = item.variant;
                    const product  = variant.product;
                    const subtotal = (item.price - (item.discount ?? 0)) * item.qty;
                    return (
                        <tr key={index} className="hover:bg-slate-50">
                            <td>
                                <div>
                                    <p className="font-medium text-slate-700">{product?.name ?? '—'}</p>
                                    <p className="text-xs text-slate-400">{variant?.code}{variant?.name ? ` · ${variant.name}` : ''}</p>
                                </div>
                            </td>
                            <td>{formatPrice(item.price)}</td>
                            <td>
                                {item.discount
                                    ? <span className="text-red-500">- {formatPrice(item.discount)}</span>
                                    : <span className="text-slate-300">—</span>
                                }
                            </td>
                            <td>{item.qty}</td>
                            <td className="font-medium">{formatPrice(subtotal)}</td>
                        </tr>
                    );
                })}
            </Table>

            <div className="flex justify-end mt-1 pr-1">
                <p className="text-xs text-slate-500">
                    Subtotal: <span className="font-semibold text-slate-700">{formatPrice(total)}</span>
                </p>
            </div>
        </div>
    );
}

export default function Show({ isOpen, onClose, sale, products }) {
    if (!sale) return null;

    const total = (sale.items ?? []).reduce(
        (sum, i) => sum + (i.price - (i.discount ?? 0)) * i.qty,
        0
    );

    return (
        <Popup
            title="Detail Penjualan"
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-2xl"
        >
            {/* ── Sale header info ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
                <InfoRow label="Tanggal"       value={formatDate(sale.date)} />
                <InfoRow label="Waktu"         value={formatTime(sale.time)} />
                <InfoRow label="Pelanggan"     value={sale.customer_name} />
                <InfoRow label="Nomor Antrian" value={sale.queue_number} />
                <InfoRow
                    label="Status"
                    value={
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${statusBadge[sale.status] ?? statusBadge.Draft}`}>
                            {sale.status}
                        </span>
                    }
                />
            </div>

            {/* ── Sold items ── */}
            <h2 className="font-bold text-emerald-700 mt-5 mb-2">Produk Terjual</h2>
            <ItemsTable
                items={sale.items ?? []}
                emptyText="Tidak ada produk terjual."
            />

            {/* ── Total + print ── */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-end">
                <PrintReceipt sale={sale} products={products} />

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-6 py-3 text-right">
                    <p className="text-xs text-emerald-500 mb-0.5">Total</p>
                    <p className="text-xl font-bold text-emerald-700">{formatPrice(total)}</p>
                </div>
            </div>
        </Popup>
    );
}
