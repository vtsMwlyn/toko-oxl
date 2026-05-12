import Popup from '@/Components/Popup';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Remove({ isOpen, onClose, onConfirm, item, products }) {
    const variant = products?.flatMap(p => p.variants).find(v => v.id === item?.variant_id);
    const product = products?.find(p => p.id === variant?.product_id);

    return (
        <Popup title="Hapus Item" isOpen={isOpen} onClose={onClose} className="max-w-sm">
            <p>
                Hapus <strong>{product?.name ?? '—'}</strong>{variant?.name ? ` (${variant.name})` : ''} (x{item?.qty}) dari daftar?
            </p>
            <div className="flex justify-center mt-4">
                <PrimaryButton type="button" className="w-36" onClick={onConfirm}>
                    Konfirmasi
                </PrimaryButton>
            </div>
        </Popup>
    );
}
