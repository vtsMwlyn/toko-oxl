import Popup from '@/Components/Popup';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Remove({ isOpen, onClose, onConfirm, item, products }) {
    const product = products?.find(p => p.id === item?.product_id);

    return (
        <Popup title="Hapus Item" isOpen={isOpen} onClose={onClose} className="max-w-sm">
            <p>
                Hapus <strong>{product?.name ?? '—'}</strong> (x{item?.qty}) dari daftar?
            </p>
            <div className="flex justify-center mt-4">
                <PrimaryButton type="button" className="w-36" onClick={onConfirm}>
                    Konfirmasi
                </PrimaryButton>
            </div>
        </Popup>
    );
}
