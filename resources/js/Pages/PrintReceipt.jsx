import { useRef } from 'react';
import { Printer } from 'lucide-react';

import PrimaryButton from '@/Components/PrimaryButton';
import formatPrice from '@/Helpers/formatPrice';

// ── Helpers ───────────────────────────────────────────────────────────────────

function ReceiptDivider({ dashed = false }) {
    return (
        <div style={{
            borderTop: dashed ? '1px dashed #ccc' : '1px solid #000',
            margin: '6px 0',
        }} />
    );
}

function ReceiptRow({ label, value, bold = false }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: bold ? '700' : '400', margin: '1px 0' }}>
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}

// ── Receipt content (rendered off-screen, printed) ────────────────────────────

function ReceiptContent({ sale, products }) {
    const soldItems   = sale.items?.filter(i => i.type === 'Sell')   ?? [];
    const returnItems = sale.items?.filter(i => i.type === 'Return') ?? [];

    const soldTotal   = soldItems.reduce((sum, i)   => sum + (i.price - (i.discount ?? 0)) * i.qty, 0);
    const returnTotal = returnItems.reduce((sum, i) => sum + (i.price - (i.discount ?? 0)) * i.qty, 0);
    const grandTotal  = soldTotal - returnTotal;

    const base = {
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: '11px',
        color: '#000',
        lineHeight: '1.4',
    };

    return (
        <div style={{ ...base, width: '100%', marginLeft: '-15px', marginTop: '-20px' }}>

            {/* ── Store header ── */}
            <div style={{ textAlign: 'center', marginBottom: '6px' }}>
                <p style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 2px' }}>Toko OXL</p>
                <p style={{ fontSize: '10px', margin: 0 }}>Toko Perlengkapan Alat Muslim</p>
            </div>

            <ReceiptDivider />

            {/* ── Sale info ── */}
            <ReceiptRow label="Tanggal" value={sale.date} />
            <ReceiptRow label="Waktu"   value={sale.time} />
            {sale.customer_name && (
                <ReceiptRow label="Pelanggan" value={sale.customer_name} />
            )}
            <ReceiptRow label="Status" value={sale.status === 'fixed' ? 'Lunas' : 'Draft'} />

            {/* ── Sold items ── */}
            {soldItems.length > 0 && (
                <>
                    <ReceiptDivider dashed />
                    <p style={{ fontSize: '10px', fontWeight: '700', margin: '3px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Produk Terjual</p>
                    {soldItems.map((item, index) => {
                        const product  = products.find(p => p.id === item.product_id);
                        const subtotal = (item.price - (item.discount ?? 0)) * item.qty;
                        return (
                            <div key={index} style={{ marginBottom: '4px' }}>
                                <p style={{ margin: '0', fontWeight: '600', fontSize: '11px' }}>
                                    {product?.name ?? '—'}{product?.variant ? ` (${product.variant})` : ''}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#333' }}>
                                    <span>
                                        {item.qty} x {formatPrice(item.price)}
                                        {item.discount > 0 ? ` - ${formatPrice(item.discount)}` : ''}
                                    </span>
                                    <span style={{ fontWeight: '600' }}>{formatPrice(subtotal)}</span>
                                </div>
                            </div>
                        );
                    })}
                    <ReceiptRow label="Subtotal" value={formatPrice(soldTotal)} />
                </>
            )}

            {/* ── Return items ── */}
            {returnItems.length > 0 && (
                <>
                    <ReceiptDivider dashed />
                    <p style={{ fontSize: '10px', fontWeight: '700', margin: '3px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Produk Retur</p>
                    {returnItems.map((item, index) => {
                        const product  = products.find(p => p.id === item.product_id);
                        const subtotal = (item.price - (item.discount ?? 0)) * item.qty;
                        return (
                            <div key={index} style={{ marginBottom: '4px' }}>
                                <p style={{ margin: '0', fontWeight: '600', fontSize: '11px' }}>
                                    {product?.name ?? '—'}{product?.variant ? ` (${product.variant})` : ''}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#333' }}>
                                    <span>
                                        {item.qty} x {formatPrice(item.price)}
                                        {item.discount > 0 ? ` - ${formatPrice(item.discount)}` : ''}
                                    </span>
                                    <span style={{ fontWeight: '600' }}>- {formatPrice(subtotal)}</span>
                                </div>
                            </div>
                        );
                    })}
                    <ReceiptRow label="Subtotal Retur" value={`- ${formatPrice(returnTotal)}`} />
                </>
            )}

            <ReceiptDivider />

            {/* ── Grand total ── */}
            {returnItems.length > 0 && (
                <>
                    <ReceiptRow label="Total Penjualan" value={formatPrice(soldTotal)} />
                    <ReceiptRow label="Total Retur"     value={`- ${formatPrice(returnTotal)}`} />
                </>
            )}
            <ReceiptRow label="TOTAL" value={formatPrice(grandTotal)} bold />

            <ReceiptDivider />

            {/* ── Footer ── */}
            <p style={{ textAlign: 'center', fontSize: '10px', marginTop: '6px' }}>
                Terima kasih atas pembelian Anda!
            </p>
            <p style={{ textAlign: 'center', fontSize: '10px' }}>
                Barang yang sudah dibeli tidak dapat dikembalikan.
            </p>

            <p style={{ textAlign: 'center', fontSize: '10px' }}>
                --oOOo--
            </p>
        </div>
    );
}

// ── Public component ──────────────────────────────────────────────────────────

export default function PrintReceipt({ sale, products }) {
    const printRef = useRef(null);

    function handlePrint() {
        const content = printRef.current?.innerHTML;
        if (!content) return;

        const win = window.open('', '_blank', 'width=900,height=700');
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Struk Penjualan</title>
                <style>
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                    * { box-sizing: border-box; }
                    body {
                        margin: 0;
                        padding: 4mm;
                        font-family: 'Courier New', Courier, monospace;
                        font-size: 11px;
                        color: #000;
                        background: #fff;
                        width: 80mm;
                    }
                    @media print {
                        body { width: 80mm; }
                    }
                </style>
            </head>
            <body>${content}</body>
            </html>
        `);
        win.document.close();
        win.focus();
        // Small delay so fonts and layout settle before the print dialog opens
        setTimeout(() => {
            win.print();
            win.close();
        }, 250);
    }

    return (
        <>
            {/* ── Print button ── */}
            <PrimaryButton
                type="button"
                icon={<Printer className="size-4" />}
                onClick={handlePrint}
            >
                Cetak Struk
            </PrimaryButton>

            {/* ── Off-screen receipt (used as print source) ── */}
            <div ref={printRef} style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <ReceiptContent sale={sale} products={products} />
            </div>
        </>
    );
}
