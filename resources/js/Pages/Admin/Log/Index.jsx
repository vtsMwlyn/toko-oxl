import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useCallback, useState, useRef } from 'react';
import Pagination, { isNavigating } from '@/Components/Pagination';
import axios from 'axios';

const roleBadge = {
    Admin: 'bg-emerald-100 text-emerald-700',
    User:  'bg-slate-100 text-slate-600',
};

const fieldLabels = {
    // Sale
    date:            'Tanggal',
    time:            'Waktu',
    status:          'Status',
    type:            'Tipe',
    customer_name:   'Pelanggan',
    queue_number:    'Antrian',
    // Product / Variant / Discount
    name:            'Nama',
    normal_price:    'Harga Normal',
    customer_price:  'Harga Customer',
    code:            'Kode',
    stock:           'Stok',
    low_stock_warning: 'Batas Stok Rendah',
    min_qty:         'Min Qty',
    // Customer
    phone:           'Telepon',
    address:         'Alamat',
    notes:           'Catatan',
    // User
    email:           'Email',
    role:            'Role',
    password:        'Password',
    // Barcode config
    qty:             'Qty',
    width_cm:        'Lebar (cm)',
    height_cm:       'Tinggi (cm)',
    gap_x_mm:        'Gap X (mm)',
    gap_y_mm:        'Gap Y (mm)',
    margin_top_mm:    'Margin Atas (mm)',
    margin_right_mm:  'Margin Kanan (mm)',
    margin_bottom_mm: 'Margin Bawah (mm)',
    margin_left_mm:   'Margin Kiri (mm)',
};

function formatDateTime(datetime) {
    const date = new Date(datetime.replace(' ', 'T'));

    const formattedDate = new Intl.DateTimeFormat('en-GB', {
        day:   'numeric',
        month: 'long',
        year:  'numeric',
    }).format(date);

    const formattedTime = new Intl.DateTimeFormat('en-GB', {
        hour:   '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);

    return [formattedDate, formattedTime];
}

function Avatar({ name }) {
    const initials = name
        ?.split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase() ?? '?';

    return (
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600 shrink-0">
            {initials}
        </div>
    );
}

function ReturnBadge() {
    return (
        <span className="ml-1 px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 text-rose-700 border border-rose-200">
            Return
        </span>
    );
}

function SectionLabel({ children }) {
    return (
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">
            {children}
        </p>
    );
}

function ChangesPills({ changes }) {
    const grouped = {
        created: changes?.filter(c => c.field && !c.type && c.old === null && c.new !== null) ?? [],
        deleted: changes?.filter(c => c.field && !c.type && c.new === null && c.old !== null) ?? [],
        updated: changes?.filter(c => c.field && !c.type && c.old !== null && c.new !== null) ?? [],
        added:   changes?.filter(c => c.type === 'added') ?? [],
        removed: changes?.filter(c => c.type === 'removed') ?? [],
        itemUpdated: changes?.filter(c => c.type === 'updated') ?? [],
        stock:   changes?.filter(c => c.type === 'stock') ?? [],
    };

    const hasChanges = Object.values(grouped).some(g => g.length > 0);
    if (!hasChanges) return null;

    return (
        <div className="border-t border-gray-100 pt-3 mt-1 flex flex-col gap-3">

            {grouped.stock.length > 0 && (
                <div>
                    <SectionLabel>Perubahan stok</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                        {grouped.stock.map((c, i) => (
                            <span
                                key={`stock-${i}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200"
                            >
                                {c.product_name ?? '?'} · {c.variant_name ?? '?'}
                                <span className="opacity-60 mx-0.5">stok:</span>
                                {c.old} → {c.new}
                                <span className={`font-semibold ml-0.5 ${c.delta < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                    ({c.delta > 0 ? '+' : ''}{c.delta})
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {grouped.created.length > 0 && (
                <div>
                    <SectionLabel>Data dibuat</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                        {grouped.created.map(c => (
                            <span
                                key={`created-${c.field}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                            >
                                {fieldLabels[c.field] ?? c.field}:
                                <span className="font-semibold">
                                    {c.new !== null && c.new !== '' && c.new !== undefined ? String(c.new) : <span className="opacity-40 italic">—</span>}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {grouped.deleted.length > 0 && (
                <div>
                    <SectionLabel>Data sebelum dihapus</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                        {grouped.deleted.map(c => (
                            <span
                                key={`deleted-${c.field}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"
                            >
                                {fieldLabels[c.field] ?? c.field}:
                                <span className="font-semibold">
                                    {c.old !== null && c.old !== '' && c.old !== undefined ? String(c.old) : <span className="opacity-40 italic">—</span>}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {grouped.updated.length > 0 && (
                <div>
                    <SectionLabel>Perubahan data</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                        {grouped.updated.map(c => (
                            <span
                                key={`field-${c.field}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700 border border-violet-200"
                            >
                                {fieldLabels[c.field] ?? c.field}: {c.old} → {c.new}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {grouped.added.length > 0 && (
                <div>
                    <SectionLabel>Items added</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                        {grouped.added.map(c => (
                            <span
                                key={`added-${c.variant_id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700 border border-teal-200"
                            >
                                + {c.product_name ?? '?'} · {c.variant_name ?? '?'}
                                <span className="opacity-60 mx-0.5">qty {c.new?.qty}</span>
                                {c.new?.type === 'Return' && <ReturnBadge />}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {grouped.removed.length > 0 && (
                <div>
                    <SectionLabel>Items removed</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                        {grouped.removed.map(c => (
                            <span
                                key={`removed-${c.variant_id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200"
                            >
                                − {c.product_name ?? '?'} · {c.variant_name ?? '?'}
                                {c.old?.type === 'Return' && <ReturnBadge />}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {grouped.itemUpdated.length > 0 && (
                <div>
                    <SectionLabel>Items updated</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                        {grouped.itemUpdated.map(c => (
                            <span
                                key={`updated-${c.variant_id}-${c.field ?? ''}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 border border-sky-200"
                            >
                                {c.product_name ?? '?'} · {c.variant_name ?? '?'}
                                <span className="opacity-60 ml-0.5">{c.field}:</span> {c.old} → {c.new}
                            </span>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}

function LogCard({ log }) {
    const [date, time] = formatDateTime(log.created_at);

    return (
        <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
                <Avatar name={log.user.name} />
                <div className="flex-1 min-w-0">

                    {/* Header row */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-gray-800">{log.user.name}</span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${roleBadge[log.user.role] ?? roleBadge.User}`}>
                            {log.user.role}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">{date} · {time}</span>
                    </div>

                    {/* Message */}
                    <p className="text-sm text-gray-500 leading-relaxed">{log.message}</p>

                    {/* Changes */}
                    <ChangesPills changes={log.changes} />

                </div>
            </div>
        </div>
    );
}

export default function Index({ logs: initialLogs, filters }) {
    const [logs, setLogs] = useState(initialLogs);
    const [dateStart, setDateStart] = useState(filters?.date_start ?? '');
    const [dateEnd, setDateEnd] = useState(filters?.date_end ?? '');
    const isFirstRender = useRef(true);
    const searchPending = useRef(false);

    useEffect(() => {
        setLogs(initialLogs);
    }, [initialLogs]);

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        searchPending.current = true;
        const timer = setTimeout(() => {
            const params = {};
            if (dateStart) params.date_start = dateStart;
            if (dateEnd) params.date_end = dateEnd;
            router.get(route('admin.log.index'), params, { preserveState: true, preserveScroll: true });
            searchPending.current = false;
        }, 500);
        return () => { clearTimeout(timer); searchPending.current = false; };
    }, [dateStart, dateEnd]);

    useEffect(() => {
        const doReload = () => {
            if (document.visibilityState === 'hidden') return;
            axios.get(window.location.href, { headers: { 'X-Inertia': 'true' } })
                .then(res => {
                    setLogs(res.data.props.logs);
                })
                .catch(console.error);
        };

        const id = setInterval(doReload, 15000);
        document.addEventListener('visibilitychange', doReload);
        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', doReload);
        };
    }, []);

    return (
        <AuthenticatedLayout title="Log Aksi Sistem">
            <Head title="Log" />

            <div className="w-full flex justify-end items-center mb-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                        type="date"
                        className="border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm w-full sm:w-auto"
                        value={dateStart}
                        onChange={e => setDateStart(e.target.value)}
                    />
                    <span className="text-gray-400 text-sm px-1">sampai</span>
                    <input
                        type="date"
                        className="border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm w-full sm:w-auto"
                        value={dateEnd}
                        onChange={e => setDateEnd(e.target.value)}
                    />
                    {(dateStart || dateEnd) && (
                        <button
                            type="button"
                            onClick={() => { setDateStart(''); setDateEnd(''); }}
                            className="text-xs text-red-500 hover:text-red-700 ml-1 font-medium"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {logs.data.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">
                    Belum ada log aksi.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {logs.data.map((log, index) => (
                        <LogCard key={index} log={log} />
                    ))}
                </div>
            )}
            <Pagination paginator={logs} />
        </AuthenticatedLayout>
    );
}
