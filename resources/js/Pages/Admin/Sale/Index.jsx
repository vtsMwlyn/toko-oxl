import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Eye, FileDown, ClipboardCheck, Printer } from 'lucide-react';
import { useState } from 'react';

import Table from '@/Components/Table';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

import Show from './Show';
import CreateEdit from './CreateEdit';
import Delete from './Delete';

import ExportSpecificProduct from './ExportSpecificProduct';
import PrintReceipt from '@/Pages/PrintReceipt';
import SetFixed from './SetFixed';
import ExportWithPercent from './ExportWithPercent';

import formatPrice from '@/Helpers/formatPrice';
import formatDate from '@/Helpers/formatDate';
import formatTime from '@/Helpers/formatTime';

const statusBadge = {
    Draft: 'bg-amber-100 text-amber-700',
    Fixed: 'bg-emerald-100 text-emerald-700',
};

// Modal that lists all transactions for a given date
function DateSalesModal({ isOpen, onClose, date, sales, products, onView, onEdit, onDelete, onSetFixed, auth }) {
    if (!isOpen) return null;
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
                                <th className="px-4 py-3 text-left">No. Antrian</th>
                                <th className="px-4 py-3 text-left">Waktu</th>
                                <th className="px-4 py-3 text-left">Pelanggan</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Total</th>
                                <th className="px-4 py-3 text-left">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sales.map((sale, index) => (
                                <tr key={index} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">{sale.queue_number}</td>
                                    <td className="px-4 py-3">{formatTime(sale.time)}</td>
                                    <td className="px-4 py-3">{sale.customer_name || <span className="text-slate-400 italic">—</span>}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${statusBadge[sale.status] ?? statusBadge.Draft}`}>
                                            {sale.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{formatPrice(sale.total)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2 items-center">
                                            {sale.status === 'Draft' && (
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
                                            <PrimaryButton
                                                styled={false} className="text-emerald-600"
                                                icon={<Pencil className="size-4" />} type="button"
                                                onClick={() => onEdit(sale)}
                                            />
                                            {auth.user.role === 'Admin' && (
                                                <PrimaryButton
                                                    styled={false} className="text-emerald-600"
                                                    icon={<Trash2 className="size-4" />} type="button"
                                                    onClick={() => onDelete(sale)}
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 border-t text-sm text-slate-500 flex justify-between">
                    <span>{sales.length} transaksi</span>
                    <span className="font-medium text-slate-700">
                        Total: {formatPrice(sales.reduce((sum, s) => sum + (s.total ?? 0), 0))}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function Index({ sales, products, customers }) {
    const { auth } = usePage().props;

    const [isViewing,  setIsViewing]  = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing,  setIsEditing]  = useState(null);
    const [isDeleting, setIsDeleting] = useState(null);

    const [exportType, setExportType] = useState(null);
    const [isExportingSpecificProduct, setIsExportingSpecificProduct] = useState(false);
    const [isSettingFixed, setIsSettingFixed] = useState(false);

    const [selectedTab, setSelectedTab] = useState(auth.user.role === 'Admin' ? 'All' : 'Draft');

    // Date group modal state
    const [viewingDateGroup, setViewingDateGroup] = useState(null); // { date, sales }

    // Today's date string in the same format as sale.date
    const todayStr = new Date().toISOString().slice(0, 10);

    // Sales filtered to today only (for Draft/Fixed tabs)
    const todaySales = sales.filter(s => s.date?.slice(0, 10) === todayStr);

    // Sales grouped by date (for All tab), sorted newest first
    const salesByDate = sales.reduce((acc, sale) => {
        const dateKey = sale.date?.slice(0, 10) ?? 'Unknown';
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(sale);
        return acc;
    }, {});
    const sortedDates = Object.keys(salesByDate).sort((a, b) => b.localeCompare(a));

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
                            <PrimaryButton icon={<FileDown className="size-4" />} type="button" onClick={() => setExportType('product')}>
                                Export per Produk
                            </PrimaryButton>
                            <PrimaryButton icon={<FileDown className="size-4" />} type="button" onClick={() => setExportType('sale')}>
                                Export per Transaksi
                            </PrimaryButton>
                            <PrimaryButton icon={<FileDown className="size-4" />} type="button" onClick={() => setIsExportingSpecificProduct(true)}>
                                Export Produk Spesifik
                            </PrimaryButton>
                        </div>
                        <TextInput placeholder="Cari penjualan..." />
                    </div>

                    <div className="w-1/3 grid grid-cols-3 mt-6 gap-1">
                        <button type="button" className={`border-b-4 pb-1 ${selectedTab === 'Fixed' ? 'border-emerald-600' : 'border-transparent hover:border-slate-300'}`} onClick={() => setSelectedTab('Fixed')}>Fixed</button>
                        <button type="button" className={`border-b-4 pb-1 ${selectedTab === 'Draft' ? 'border-emerald-600' : 'border-transparent hover:border-slate-300'}`} onClick={() => setSelectedTab('Draft')}>Draft</button>
                        <button type="button" className={`border-b-4 pb-1 ${selectedTab === 'All' ? 'border-emerald-600' : 'border-transparent hover:border-slate-300'}`} onClick={() => setSelectedTab('All')}>Riwayat</button>
                    </div>
                </>
            )}

            {/* ALL TAB — grouped by date */}
            {selectedTab === 'All' ? (
                <Table
                    isEmpty={sortedDates.length === 0}
                    headers={['Tanggal', 'Jumlah Transaksi', 'Total', 'Aksi']}
                    className="mt-4"
                >
                    {sortedDates.map((dateKey) => {
                        const group = salesByDate[dateKey];
                        const groupTotal = group.reduce((sum, s) => sum + (s.total ?? 0), 0);
                        return (
                            <tr key={dateKey} className="hover:bg-slate-200">
                                <td>{formatDate(dateKey)}</td>
                                <td>{group.length} transaksi</td>
                                <td>{formatPrice(groupTotal)}</td>
                                <td>
                                    <PrimaryButton
                                        styled={false} className="text-emerald-600"
                                        icon={<Eye className="size-4" />} type="button"
                                        onClick={() => setViewingDateGroup({ date: dateKey, sales: group })}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </Table>
            ) : (
                /* DRAFT / FIXED TABS — today only */
                <Table
                    isEmpty={todaySales.filter(s => s.status === selectedTab).length === 0}
                    headers={['Tanggal', 'Waktu', 'No. Antrian', 'Pelanggan', 'Status', 'Total', 'Aksi']}
                    className={auth.user.role === 'Admin' ? 'mt-4' : ''}
                >
                    {todaySales.filter(s => s.status === selectedTab).map((sale, index) => (
                        <tr key={index} className="hover:bg-slate-200">
                            <td>{formatDate(sale.date)}</td>
                            <td>{formatTime(sale.time)}</td>
                            <td>{sale.queue_number}</td>
                            <td>{sale.customer_name || <span className="text-slate-400 italic">—</span>}</td>
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
                                        onClick={() => setIsViewing(sale)}
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
                    sales={viewingDateGroup.sales}
                    products={products}
                    auth={auth}
                    onView={(sale) => { setViewingDateGroup(null); setIsViewing(sale); }}
                    onEdit={(sale) => { setViewingDateGroup(null); setIsEditing(sale); }}
                    onDelete={(sale) => { setViewingDateGroup(null); setIsDeleting(sale); }}
                    onSetFixed={(sale) => { setViewingDateGroup(null); setIsSettingFixed(sale); }}
                />
            )}

            {isViewing && (
                <Show isOpen={!!isViewing} onClose={() => setIsViewing(null)} sale={isViewing} products={products} />
            )}
            {isCreating && (
                <CreateEdit mode="Create" isOpen={isCreating} onClose={() => setIsCreating(false)} products={products} customers={customers} />
            )}
            {isEditing && (
                <CreateEdit mode="Edit" isOpen={!!isEditing} onClose={() => setIsEditing(null)} sale={isEditing} products={products} customers={customers} />
            )}
            {isDeleting && (
                <Delete isOpen={!!isDeleting} onClose={() => setIsDeleting(null)} sale={isDeleting} />
            )}
            {isExportingSpecificProduct && (
                <ExportSpecificProduct isOpen={isExportingSpecificProduct} onClose={() => setIsExportingSpecificProduct(false)} products={products} />
            )}
            {exportType && (
                <ExportWithPercent type={exportType} onClose={() => setExportType(null)} />
            )}
            {isSettingFixed && (
                <SetFixed isOpen={isSettingFixed} onClose={() => setIsSettingFixed(false)} sale={isSettingFixed} />
            )}
        </AuthenticatedLayout>
    );
}
