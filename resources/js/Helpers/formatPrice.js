export default function formatPrice(value) {
    if (value === null || value === undefined) return 'N/A';

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value).replace(/[\u00A0\u202F]/g, ' ');
}
