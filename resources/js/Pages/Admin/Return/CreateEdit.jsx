import { router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

import Popup from '@/Components/Popup';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import OperationSuccess from '@/Components/OperationSuccess';
import Select from '@/Components/Select';

export default function CreateEdit({ mode, isOpen, onClose, item, products }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const variantOptions = products.flatMap(product =>
        product.variants.map(variant => ({
            value:   variant.id,
            label:   `${variant.code} — ${product.name}${variant.name ? ` (${variant.name})` : ''}`,
            variant: { ...variant, product },
        }))
    );

    const initialOption = item
        ? (variantOptions.find(o => o.value === item.variant_id) ?? null)
        : null;

    const [selectedOption, setSelectedOption] = useState(initialOption);

    const { data, setData, errors, setError } = useForm({
        date:       item?.date ?? new Date().toISOString().slice(0, 10),
        variant_id: item?.variant_id ?? '',
        qty:        item?.qty ?? '',
    });

    function handleVariantChange(option) {
        setSelectedOption(option);
        setData('variant_id', option?.value ?? '');
    }

    function submit(e) {
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
            router.post(route('admin.return.store'), data, afterSubmission);
        } else {
            router.put(route('admin.return.update', { return: item.id }), data, afterSubmission);
        }
    }

    return (
        <Popup
            title={mode === 'Create' ? 'Tambah Retur' : 'Ubah Retur'}
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-sm"
        >
            {success ? (
                <OperationSuccess
                    type={mode === 'Create' ? 'Create' : 'Edit'}
                    message={mode === 'Create' ? 'Data retur berhasil ditambahkan.' : 'Data retur berhasil diperbarui.'}
                />
            ) : (
                <form onSubmit={submit} className="flex flex-col gap-4">

                    <div className="grid gap-1">
                        <InputLabel htmlFor="return-date" value="Tanggal" />
                        <TextInput
                            id="return-date"
                            type="date"
                            value={data.date}
                            className="block w-full"
                            onChange={e => setData('date', e.target.value)}
                        />
                        <InputError message={errors.date} />
                    </div>

                    <div className="grid gap-1">
                        <InputLabel value="Produk" />
                        <Select
                            options={variantOptions}
                            value={selectedOption}
                            onChange={handleVariantChange}
                            placeholder="Cari kode atau nama produk..."
                            isClearable
                        />
                        <InputError message={errors.variant_id} />
                    </div>

                    <div className="grid gap-1">
                        <InputLabel htmlFor="return-qty" value="Qty" />
                        <TextInput
                            id="return-qty"
                            type="number"
                            min="1"
                            value={data.qty}
                            className="block w-full"
                            onChange={e => setData('qty', e.target.value)}
                        />
                        <InputError message={errors.qty} />
                    </div>

                    <div className="flex justify-center mt-2">
                        <PrimaryButton type="submit" disabled={loading} loading={loading} className="w-40">
                            {mode === 'Create'
                                ? (!loading ? 'Simpan'   : 'Menyimpan...')
                                : (!loading ? 'Perbarui' : 'Memperbarui...')
                            }
                        </PrimaryButton>
                    </div>
                </form>
            )}
        </Popup>
    );
}
