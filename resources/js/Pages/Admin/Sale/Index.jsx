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
                        <button type="button" className={`border-b-4 pb-1 ${selectedTab === 'All' ? 'border-emerald-600' : 'border-transparent hover:border-slate-300'}`} onClick={() => setSelectedTab('All')}>Semua</button>
                        <button type="button" className={`border-b-4 pb-1 ${selectedTab === 'Fixed' ? 'border-emerald-600' : 'border-transparent hover:border-slate-300'}`} onClick={() => setSelectedTab('Fixed')}>Fixed</button>
                        <button type="button" className={`border-b-4 pb-1 ${selectedTab === 'Draft' ? 'border-emerald-600' : 'border-transparent hover:border-slate-300'}`} onClick={() => setSelectedTab('Draft')}>Draft</button>
                    </div>
                </>
            )}

            <Table
                isEmpty={sales.length === 0}
                headers={['Tanggal', 'Waktu', 'No. Antrian', 'Pelanggan', 'Status', 'Total', 'Aksi']}
                className={auth.user.role === 'Admin' ? 'mt-4' : ''}
            >
                {sales.filter(s => s.status.toLowerCase().includes(selectedTab === 'All' ? '' : selectedTab.toLocaleLowerCase())).map((sale, index) => (
                    <tr key={index} className="hover:bg-slate-200">
                        <td>{formatDate(sale.date)}</td>
                        <td>{formatTime(sale.time)}</td>
                        <td>{sale.queue_number}</td>
                        <td>{sale.customer_name || <span className="text-slate-400 italic">—</span>}</td>
                        <td>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${statusBadge[sale.status] ?? statusBadge.draft}`}>
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
