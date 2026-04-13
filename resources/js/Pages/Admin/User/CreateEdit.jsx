import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

import Popup from '@/Components/Popup';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import OperationSuccess from '@/Components/OperationSuccess';

const ROLES = ['Admin', 'User'];

export default function CreateEdit({ mode, isOpen, onClose, user }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { data, setData, errors, setError, reset } = useForm({
        name:                  user?.name  || '',
        email:                 user?.email || '',
        role:                  user?.role  || 'User',
        password:              '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);

        const afterSubmission = {
            onSuccess: () => {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    onClose();
                }, 500);
            },
            onError: (serverErrors) => {
                Object.entries(serverErrors).forEach(([key, message]) => {
                    setError(key, message);
                });
            },
            onFinish: () => setLoading(false),
        };

        if (mode === 'Create') {
            router.post(route('admin.user.store'), data, afterSubmission);
        } else {
            router.post(route('admin.user.update', { user: user?.id }), data, afterSubmission);
        }
    };

    return (
        <Popup
            title={mode === 'Create' ? 'Tambah Pengguna Baru' : 'Ubah Data Pengguna'}
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-lg"
        >
            {success ? (
                <OperationSuccess
                    type={mode === 'Create' ? 'Create' : 'Edit'}
                    message={mode === 'Create' ? 'Pengguna baru berhasil ditambahkan.' : 'Data pengguna berhasil diperbarui.'}
                />
            ) : (
                <form onSubmit={submit} className="w-full flex flex-col">

                    {/* ── Name ── */}
                    <div className="w-full grid mb-4 gap-1">
                        <InputLabel htmlFor="name" value="Nama" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    {/* ── Email ── */}
                    <div className="w-full grid mb-4 gap-1">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            name="email"
                            type="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    {/* ── Role ── */}
                    <div className="w-full grid mb-4 gap-1">
                        <InputLabel htmlFor="role" value="Role" />
                        <select
                            id="role"
                            name="role"
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            {ROLES.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                        <InputError message={errors.role} className="mt-2" />
                    </div>

                    {/* ── Password ── */}
                    <div className="w-full grid mb-4 gap-1">
                        <InputLabel
                            htmlFor="password"
                            value={mode === 'Edit' ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}
                        />
                        <TextInput
                            id="password"
                            name="password"
                            type="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    {/* ── Password confirmation ── */}
                    <div className="w-full grid mb-4 gap-1">
                        <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" />
                        <TextInput
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <div className="w-full flex justify-center mt-4">
                        <PrimaryButton type="submit" disabled={loading} loading={loading} className="w-40">
                            {mode === 'Create'
                                ? (!loading ? 'Tambah' : 'Menambahkan...')
                                : (!loading ? 'Simpan' : 'Menyimpan...')
                            }
                        </PrimaryButton>
                    </div>
                </form>
            )}
        </Popup>
    );
}
