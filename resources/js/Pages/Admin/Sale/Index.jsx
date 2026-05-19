import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Eye, ClipboardCheck } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import Table from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

import Show from './Show';
import CreateEdit from './CreateEdit';
import Delete from './Delete';
import BatchDelete from './BatchDelete';

import PrintReceipt from '@/Pages/PrintReceipt';
import SetFixed from './SetFixed';

import formatPrice from '@/Helpers/formatPrice';
import formatDate from '@/Helpers/formatDate';
import formatTime from '@/Helpers/formatTime';
import Pagination from '@/Components/Pagination';

const statusBadge = {
    Draft: 'bg-amber-100 text-amber-700',
    Fixed: 'bg-emerald-100 text-emerald-700',
};

// Modal that lists all transactions for a given date, with batch-select support
function DateSalesModal({
    isOpen, onClose, date, sales, products,
    onView, onEdit, onDelete, onSetFixed,
    onBatchDelete, auth,
}) {
    const [selectedIds, setSelectedIds] = useState([]);

    if (!isOpen) return null;

    const allSelected = sales.length > 0 && sales.every(s => selectedIds.includes(s.id));

    const toggleAll = () => {
        setSelectedIds(allSelected ? [] : sales.map(s => s.id));
    };

    const toggleOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold">Transaksi — {formatDate(date)}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>

                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                            <tr>
                                {auth.user.role === 'Admin' && (
                                    <th className="px-4 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleAll}
                                            className="accent-emerald-600 cursor-pointer"
                                            title="Pilih semua"
                                        />
                                    </th>
                                )}
                                <th className="px-4 py-3 text-left">No. Antrian</th>
                                <th className="px-4 py-3 text-left">Waktu</th>
                                <th className="px-4 py-3 text-left">Pelanggan</th>
                                {auth.user.role === 'Admin' && (
                                    <th className="px-4 py-3 text-left">Kasir</th>
                                )}
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Total</th>
                                <th className="px-4 py-3 text-left">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sales.map((sale, index) => (
                                <tr key={index} className="hover:bg-slate-50">
                                    {auth.user.role === 'Admin' && (
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(sale.id)}
                                                onChange={() => toggleOne(sale.id)}
                                                className="accent-emerald-600 cursor-pointer"
                                            />
                                        </td>
                                    )}
                                    <td className="px-4 py-3">{sale.queue_number}</td>
                                    <td className="px-4 py-3">{formatTime(sale.time)}</td>
                                    <td className="px-4 py-3">{sale.customer_name || <span className="text-slate-400 italic">—</span>}</td>
                                    {auth.user.role === 'Admin' && (
                                        <td className="px-4 py-3 text-sm text-slate-500">{sale.cashier_name || <span className="italic text-slate-300">—</span>}</td>
                                    )}
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${statusBadge[sale.status] ?? statusBadge.Draft}`}>
                                            {sale.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{formatPrice(sale.total)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2 items-center">
                                            {sale.status === 'Draft' && auth.user.role === 'Admin' && (
                                                <PrimaryButton
                                                    styled={false} className="text-emerald-600"
                                                    icon={<ClipboardCheck className="size-4" />} type="button"
                                                    onClick={() => onSetFixed(sale)}
                                                />
                                            )}
                                            {sale.status === 'Fixed' && (
                                                <PrintReceipt icon={true} sale={sale} products={products} />
                                            )}
                                            <PrimaryButton
                                                styled={false} className="text-emerald-600"
                                                icon={<Eye className="size-4" />} type="button"
                                                onClick={() => onView(sale)}
                                            />
                                            {auth.user.role === 'Admin' && (
                                                <>
                                                    <PrimaryButton
                                                        styled={false} className="text-emerald-600"
                                                        icon={<Pencil className="size-4" />} type="button"
                                                        onClick={() => onEdit(sale)}
                                                    />
                                                    <PrimaryButton
                                                        styled={false} className="text-emerald-600"
                                                        icon={<Trash2 className="size-4" />} type="button"
                                                        onClick={() => onDelete(sale)}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {auth.user.role === 'Admin' && selectedIds.length > 0 && (
                    <div className="px-6 py-3 border-t flex items-center justify-between bg-slate-50">
                        <span className="text-sm text-slate-600">{selectedIds.length} transaksi dipilih</span>
                        <PrimaryButton
                            icon={<Trash2 className="size-4" />}
                            type="button"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => onBatchDelete(selectedIds)}
                        >
                            Hapus ({selectedIds.length})
                        </PrimaryButton>
                    </div>
                )}

                <div className="px-6 py-3 border-t flex justify-between items-center text-sm text-slate-500">
                    <span>{sales.length} transaksi</span>
                    <span className="font-medium text-slate-700">
                        Total: {formatPrice(sales.reduce((sum, s) => sum + (s.total ?? 0), 0))}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function Index({ today_sales, history_sales, from: initialFrom, to: initialTo, products, customers }) {
    const { auth } = usePage().props;

    const [isViewing,  setIsViewing]  = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing,  setIsEditing]  = useState(null);
    const [isDeleting, setIsDeleting] = useState(null);

    const [isSettingFixed, setIsSettingFixed] = useState(false);

    const [selectedTab, setSelectedTab] = useState(auth.user.role === 'Admin' ? 'All' : 'Draft');

    // Date range filter — initialize from server props
    const [dateFrom, setDateFrom] = useState(initialFrom ?? '');
    const [dateTo,   setDateTo]   = useState(initialTo   ?? '');

    // Sync date inputs with server props (e.g. after navigation)
    useEffect(() => {
        setDateFrom(initialFrom ?? '');
        setDateTo(initialTo   ?? '');
    }, [initialFrom, initialTo]);

    // Date group modal state
    const [viewingDateGroup, setViewingDateGroup] = useState(null);

    // Batch delete at the date-group level (All tab)
    const [selectedDates, setSelectedDates] = useState([]);

    // Close date-group modal and reset selection on pagination page change
    useEffect(() => {
        setViewingDateGroup(null);
        setSelectedDates([]);
    }, [history_sales?.current_page]);

    // Batch delete state — batchIds is what gets passed to the popup
    const [selectedIds,     setSelectedIds]     = useState([]);
    const [batchIds,        setBatchIds]        = useState([]);
    const [isBatchDeleting, setIsBatchDeleting] = useState(false);

    // Reload page props every 10 seconds and whenever the tab regains focus
    const reload = useCallback(() => {
        router.reload({ only: ['today_sales', 'history_sales'], preserveScroll: true, preserveState: true });
    }, []);

    useEffect(() => {
        const id = setInterval(reload, 10000);
        document.addEventListener('visibilitychange', reload);
        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', reload);
        };
    }, [reload]);

    const salesByDate = (history_sales.data ?? []).reduce((acc, sale) => {
        const dateKey = sale.date?.slice(0, 10) ?? 'Unknown';
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(sale);
        return acc;
    }, {});
    const sortedDates = Object.keys(salesByDate).sort((a, b) => b.localeCompare(a));

    const visibleSales = selectedTab === 'All'
        ? []
        : today_sales.filter(s => s.status === selectedTab);

    const allVisibleIds = visibleSales.map(s => s.id);
    const allSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedIds.includes(id));

    const toggleAll = () => {
        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !allVisibleIds.includes(id)));
        } else {
            setSelectedIds(prev => [...new Set([...prev, ...allVisibleIds])]);
        }
    };

    const toggleOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleTabChange = (tab) => {
        setSelectedTab(tab);
        setSelectedIds([]);
        setSelectedDates([]);
    };

    const allDatesSelected = sortedDates.length > 0 && sortedDates.every(d => selectedDates.includes(d));

    const toggleAllDates = () => {
        setSelectedDates(allDatesSelected ? [] : [...sortedDates]);
    };

    const toggleOneDate = (dateKey) => {
        setSelectedDates(prev =>
            prev.includes(dateKey) ? prev.filter(d => d !== dateKey) : [...prev, dateKey]
        );
    };

    // IDs of every transaction inside the selected date groups
    const selectedDateGroupIds = selectedDates.flatMap(d => (salesByDate[d] ?? []).map(s => s.id));

    // Single entry point for opening the batch delete popup
    const openBatchDelete = (ids) => {
        setBatchIds(ids);
        setIsBatchDeleting(true);
    };

    const closeBatchDelete = () => {
        setIsBatchDeleting(false);
        setBatchIds([]);
    };

    return (
        <AuthenticatedLayout title="Penjualan">
            <Head title="Penjualan" />

            {auth.user.role === 'Admin' && (
                <>
                    <div className="w-full flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <PrimaryButton icon={<Plus className="size-4" />} type="button" onClick={() => setIsCreating(true)}>
                                Tambah Penjualan
                            </PrimaryButton>

                            {selectedIds.length > 0 && selectedTab !== 'All' && (
                                <PrimaryButton
                                    icon={<Trash2 className="size-4" />}
                                    type="button"
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => openBatchDelete(selectedIds)}
                                >
                                    Hapus ({selectedIds.length})
                                </PrimaryButton>
                            )}
                            {selectedDates.length > 0 && selectedTab === 'All' && (
                                <PrimaryButton
                                    icon={<Trash2 className="size-4" />}
                                    type="button"
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => openBatchDelete(selectedDateGroupIds)}
                                >
                                    Hapus ({selectedDates.length} hari, {selectedDateGroupIds.length} transaksi)
                                </PrimaryButton>
                            )}
                        </div>

                        {/* ── Date range filter — Riwayat tab only ── */}
                        {selectedTab === 'All' && (
                            <div className="flex items-center gap-2">
                                <TextInput
                                    type="date"
                                    value={dateFrom}
                                    onChange={e => {
                                        setDateFrom(e.target.value);
                                        router.get(route('sale.index'), { from: e.target.value, ...(dateTo ? { to: dateTo } : {}) }, { preserveState: true, preserveScroll: true });
                                    }}
                                    className="w-40"
                                />
                                <span className="text-slate-400 text-sm">—</span>
                                <TextInput
                                    type="date"
                                    value={dateTo}
                                    onChange={e => {
                                        setDateTo(e.target.value);
                                        router.get(route('sale.index'), { ...(dateFrom ? { from: dateFrom } : {}), to: e.target.value }, { preserveState: true, preserveScroll: true });
                                    }}
                                    className="w-40"
                                />
                                {(dateFrom || dateTo) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDateFrom('');
                                            setDateTo('');
                                            router.get(route('sale.index'), {}, { preserveState: true, preserveScroll: true });
                                        }}
                                        className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="w-1/3 grid grid-cols-3 mt-6 gap-1">
                        <button type="button" className={`border-b-4 pb-1 ${selectedTab === 'Fixed' ? 'border-emerald-600' : 'border-transparent hover:border-slate-300'}`} onClick={() => handleTabChange('Fixed')}>Fixed</button>
                        <button type="button" className={`border-b-4 pb-1 ${selectedTab === 'Draft' ? 'border-emerald-600' : 'border-transparent hover:border-slate-300'}`} onClick={() => handleTabChange('Draft')}>Draft</button>
                        <button type="button" className={`border-b-4 pb-1 ${selectedTab === 'All' ? 'border-emerald-600' : 'border-transparent hover:border-slate-300'}`} onClick={() => handleTabChange('All')}>Riwayat</button>
                    </div>
                </>
            )}

            {/* ALL TAB — grouped by date */}
            {selectedTab === 'All' ? (
                <>
                <Table
                    isEmpty={sortedDates.length === 0}
                    headers={[
                        auth.user.role === 'Admin'
                            ? (
                                <input
                                    type="checkbox"
                                    checked={allDatesSelected}
                                    onChange={toggleAllDates}
                                    className="accent-emerald-600 cursor-pointer"
                                    title="Pilih semua tanggal"
                                />
                            )
                            : null,
                        'Tanggal', 'Jumlah Transaksi', 'Total', 'Aksi',
                    ].filter(h => h !== null)}
                    className="mt-4"
                >
                    {sortedDates.map((dateKey) => {
                        const group = salesByDate[dateKey];
                        const groupTotal = group.reduce((sum, s) => sum + (s.total ?? 0), 0);
                        const hasDraft = group.some(s => s.status === 'Draft');
                        return (
                            <tr key={dateKey} className={`hover:bg-slate-200 ${selectedDates.includes(dateKey) ? 'bg-emerald-50' : ''}`}>
                                {auth.user.role === 'Admin' && (
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedDates.includes(dateKey)}
                                            onChange={() => toggleOneDate(dateKey)}
                                            className="accent-emerald-600 cursor-pointer"
                                        />
                                    </td>
                                )}
                                <td>
                                    <div className="flex items-center gap-2">
                                        {formatDate(dateKey)}
                                        {hasDraft && (
                                            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-700">
                                                Draft
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>{group.length} transaksi</td>
                                <td>{formatPrice(groupTotal)}</td>
                                <td>
                                    <PrimaryButton
                                        styled={false} className="text-emerald-600"
                                        icon={<Eye className="size-4" />} type="button"
                                        onClick={() => setViewingDateGroup({ date: dateKey })}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </Table>
                <Pagination paginator={history_sales} />
                </>
            ) : (
                /* DRAFT / FIXED TABS — today only, with checkboxes */
                <Table
                    isEmpty={visibleSales.length === 0}
                    headers={[
                        auth.user.role === 'Admin'
                            ? (
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleAll}
                                    className="accent-emerald-600 cursor-pointer"
                                    title="Pilih semua"
                                />
                            )
                            : null,
                        'Tanggal', 'Waktu', 'No. Antrian', 'Pelanggan',
                        ...(auth.user.role === 'Admin' ? ['Kasir'] : []),
                        'Status', 'Total', 'Aksi',
                    ].filter(h => h !== null)}
                    className={auth.user.role === 'Admin' ? 'mt-4' : ''}
                >
                    {visibleSales.map((sale, index) => (
                        <tr key={index} className={`hover:bg-slate-200 ${selectedIds.includes(sale.id) ? 'bg-emerald-50' : ''}`}>
                            {auth.user.role === 'Admin' && (
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(sale.id)}
                                        onChange={() => toggleOne(sale.id)}
                                        className="accent-emerald-600 cursor-pointer"
                                    />
                                </td>
                            )}
                            <td>{formatDate(sale.date)}</td>
                            <td>{formatTime(sale.time)}</td>
                            <td>{sale.queue_number}</td>
                            <td>{sale.customer_name || <span className="text-slate-400 italic">—</span>}</td>
                            {auth.user.role === 'Admin' && (
                                <td className="text-sm text-slate-500">{sale.cashier_name || <span className="italic text-slate-300">—</span>}</td>
                            )}
                            <td>
                                <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${statusBadge[sale.status] ?? statusBadge.Draft}`}>
                                    {sale.status}
                                </span>
                            </td>
                            <td>{formatPrice(sale.total)}</td>
                            <td>
                                <div className="flex gap-2 items-center">
                                    {sale.status === 'Draft' && (
                                        <PrimaryButton
                                            styled={false} className="text-emerald-600"
                                            icon={<ClipboardCheck className="size-4" />} type="button"
                                            onClick={() => setIsSettingFixed(sale)}
                                        />
                                    )}
                                    {sale.status === 'Fixed' && (
                                        <PrintReceipt icon={true} sale={sale} products={products} />
                                    )}
                                    <PrimaryButton
                                        styled={false} className="text-emerald-600"
                                        icon={<Eye className="size-4" />} type="button"
                                        onClick={() => setIsViewing(sale.id)}
                                    />
                                    <PrimaryButton
                                        styled={false} className="text-emerald-600"
                                        icon={<Pencil className="size-4" />} type="button"
                                        onClick={() => setIsEditing(sale)}
                                    />
                                    {auth.user.role === 'Admin' && (
                                        <PrimaryButton
                                            styled={false} className="text-emerald-600"
                                            icon={<Trash2 className="size-4" />} type="button"
                                            onClick={() => setIsDeleting(sale)}
                                        />
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </Table>
            )}

            {/* Date group modal */}
            {viewingDateGroup && (
                <DateSalesModal
                    isOpen={!!viewingDateGroup}
                    onClose={() => setViewingDateGroup(null)}
                    date={viewingDateGroup.date}
                    sales={salesByDate[viewingDateGroup.date] ?? []}
                    products={products}
                    auth={auth}
                    onView={(sale) => { setViewingDateGroup(null); setIsViewing(sale.id); }}
                    onEdit={(sale) => { setViewingDateGroup(null); setIsEditing(sale); }}
                    onDelete={(sale) => { setViewingDateGroup(null); setIsDeleting(sale); }}
                    onSetFixed={(sale) => { setViewingDateGroup(null); setIsSettingFixed(sale); }}
                    onBatchDelete={(ids) => { setViewingDateGroup(null); openBatchDelete(ids); }}
                />
            )}

            {isViewing && (
                <Show
                    isOpen={!!isViewing}
                    onClose={() => setIsViewing(null)}
                    sale={[...today_sales, ...(history_sales.data ?? [])].find(s => s.id === isViewing) ?? null}
                    products={products}
                />
            )}
            {isCreating && (
                <CreateEdit mode="Create" isOpen={isCreating} onClose={() => { setIsCreating(false); reload(); }} products={products} customers={customers} />
            )}
            {isEditing && (
                <CreateEdit mode="Edit" isOpen={!!isEditing} onClose={() => { setIsEditing(null); reload(); }} sale={isEditing} products={products} customers={customers} />
            )}
            {isDeleting && (
                <Delete isOpen={!!isDeleting} onClose={() => { setIsDeleting(null); reload(); }} sale={isDeleting} />
            )}
            {isSettingFixed && (
                <SetFixed isOpen={!!isSettingFixed} onClose={() => { setIsSettingFixed(false); reload(); }} sale={isSettingFixed} products={products} />
            )}

            {isBatchDeleting && (
                <BatchDelete
                    isOpen={isBatchDeleting}
                    onClose={() => { closeBatchDelete(); reload(); }}
                    saleIds={batchIds}
                    onSuccess={() => { setSelectedIds([]); setSelectedDates([]); }}
                />
            )}
        </AuthenticatedLayout>
    );
}
