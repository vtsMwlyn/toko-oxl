import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

import Popup from '@/Components/Popup';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import OperationSuccess from '@/Components/OperationSuccess';

export default function CreateEdit({ mode, isOpen, onClose, customer }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { data, setData, errors, setError } = useForm({
        name:    customer?.name    || '',
        phone:   customer?.phone   || '',
        address: customer?.address || '',
        notes:   customer?.notes   || '',
    });

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);

        const afterSubmission = {
            onSuccess: () => {
                setSuccess(true);
                setTimeout(() => { setSuccess(false); onClose(); }, 500);
            },
            onError: (serverErrors) => {
                Object.entries(serverErrors).forEach(([key, message]) => setError(key, message));
            },
            onFinish: () => setLoading(false),
        };

        if (mode === 'Create') {
            router.post(route('admin.customer.store'), data, afterSubmission);
        } else {
            router.post(route('admin.customer.update', { customer: customer?.id }), data, afterSubmission);
        }
    };

    return (
        <Popup
            title={mode === 'Create' ? 'Tambah Pelanggan' : 'Ubah Data Pelanggan'}
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-lg"
        >
            {success ? (
                <OperationSuccess
                    type={mode === 'Create' ? 'Create' : 'Edit'}
                    message={mode === 'Create' ? 'Pelanggan berhasil ditambahkan.' : 'Data pelanggan berhasil diperbarui.'}
                />
            ) : (
                <form onSubmit={submit} className="w-full flex flex-col">

                    {/* ── Name ── */}
                    <div className="w-full grid mb-4 gap-1">
                        <InputLabel htmlFor="name" value="Nama" />
                        <TextInput
                            id="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            onChange={e => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    {/* ── Phone ── */}
                    <div className="w-full grid mb-4 gap-1">
                        <InputLabel htmlFor="phone" value="No. Telepon" />
                        <TextInput
                            id="phone"
                            value={data.phone}
                            className="mt-1 block w-full"
                            placeholder="Opsional"
                            onChange={e => setData('phone', e.target.value)}
                        />
                        <InputError message={errors.phone} className="mt-2" />
                    </div>

                    {/* ── Address ── */}
                    <div className="w-full grid mb-4 gap-1">
                        <InputLabel htmlFor="address" value="Alamat" />
                        <TextInput
                            id="address"
                            value={data.address}
                            className="mt-1 block w-full"
                            placeholder="Opsional"
                            onChange={e => setData('address', e.target.value)}
                        />
                        <InputError message={errors.address} className="mt-2" />
                    </div>

                    {/* ── Notes ── */}
                    <div className="w-full grid mb-4 gap-1">
                        <InputLabel htmlFor="notes" value="Catatan" />
                        <textarea
                            id="notes"
                            value={data.notes}
                            rows={3}
                            placeholder="Opsional"
                            onChange={e => setData('notes', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                        />
                        <InputError message={errors.notes} className="mt-2" />
                    </div>

                    <div className="w-full flex justify-center mt-2">
                        <PrimaryButton type="submit" disabled={loading} loading={loading} className="w-40">
                            {mode === 'Create'
                                ? (!loading ? 'Tambah'  : 'Menambahkan...')
                                : (!loading ? 'Simpan'  : 'Menyimpan...')
                            }
                        </PrimaryButton>
                    </div>
                </form>
            )}
        </Popup>
    );
}
