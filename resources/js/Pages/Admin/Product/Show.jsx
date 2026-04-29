import { Plus, Pencil, Trash2, Download, Printer } from "lucide-react"
import { useState } from "react"

import Popup from "@/Components/Popup"
import PrimaryButton from "@/Components/PrimaryButton"
import Table from "@/Components/Table"
import SectionTitle from "@/Components/SectionTitle"

import AddEditDiscount from "./Discount/AddEdit"
import RemoveDiscount from "./Discount/Remove"
import AddEditVariant from "./Variant/AddEdit"
import RemoveVariant from "./Variant/Remove"

import Barcode from "@/Components/Barcode"
import PrintBarcode from "./PrintBarcode"

import formatPrice from "@/Helpers/formatPrice"

function ProductImage({ src, name, onClick }) {
    if (!src) {
        return (
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-300 text-[10px] font-medium select-none">
                –
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={name}
            onClick={onClick}
            className="w-10 h-10 rounded-lg object-cover border border-emerald-100 cursor-zoom-in hover:opacity-80 hover:scale-105 transition-all duration-150"
        />
    );
}

export default function Show({ isOpen, onClose, product }) {
    const [isAddingVariant, setIsAddingVariant] = useState(false);
    const [isEditingVariant, setIsEditingVariant] = useState(null);
    const [isRemovingVariant, setIsRemovingVariant] = useState(null);

    const [isAddingDiscount, setIsAddingDiscount] = useState(false);
    const [isEditingDiscount, setIsEditingDiscount] = useState(null);
    const [isRemovingDiscount, setIsRemovingDiscount] = useState(null);

    const [printingVariant, setPrintingVariant] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const downloadPNG = (variant) => {
        const svg = document.querySelector(`[data-barcode-id="${variant.id}"]`);
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            const link = document.createElement("a");
            link.download = `${variant.barcode}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        };

        img.src =
            "data:image/svg+xml;base64," +
            btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <Popup title="Detail Data Produk" isOpen={isOpen} onClose={onClose} className="max-w-4xl">
            <div className="w-full flex items-start gap-10">
                <div className="w-full">
                    <div className="w-5/6 grid grid-cols-3 gap-4">
                        <div className="w-full grid">
                            <h2 className="font-semibold text-sm">Nama</h2>
                            <p>{product.name}</p>
                        </div>
                        <div className="w-full grid">
                            <h2 className="font-semibold text-sm">Harga Normal</h2>
                            <p>{formatPrice(product.normal_price)}</p>
                        </div>
                        <div className="w-full grid">
                            <h2 className="font-semibold text-sm">Harga Langganan</h2>
                            <p>{formatPrice(product.customer_price)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <SectionTitle>Daftar Varian Produk</SectionTitle>

            <Table
                isEmpty={product.variants.length === 0} disableHeight={true}
                headers={['Foto', 'Nama Varian', 'Kode', 'Barcode', 'Stok', 'Aksi']}
            >
                {product.variants.map((variant, index) => (
                    <tr key={index} className="hover:bg-slate-200">
                        <td>
                            <ProductImage
                                src={variant.image_url}
                                name={`${product.name} ${variant.name}`}
                                onClick={() => variant.image_url && setPreviewImage(variant.image_url)}
                            />
                        </td>
                        <td>{variant.name}</td>
                        <td>{variant.code}</td>
                        <td>
                            <Barcode variant={variant} />
                        </td>
                        <td>{variant.stock}</td>
                        <td>
                            <div className="flex gap-2 items-center">
                                <PrimaryButton
                                    styled={false}
                                    className="text-emerald-600"
                                    icon={<Download className="size-4" />}
                                    type="button"
                                    onClick={() => downloadPNG(variant)}
                                />
                                <PrimaryButton
                                    styled={false}
                                    className="text-emerald-600"
                                    icon={<Printer className="size-4" />}
                                    type="button"
                                    onClick={() => setPrintingVariant(variant)}
                                />
                                <PrimaryButton
                                    styled={false}
                                    className="text-emerald-600"
                                    icon={<Pencil className="size-4" />}
                                    type="button"
                                    onClick={() => setIsEditingVariant(variant.id)}
                                />
                                <PrimaryButton
                                    styled={false}
                                    className="text-emerald-600"
                                    icon={<Trash2 className="size-4" />}
                                    type="button"
                                    onClick={() => setIsRemovingVariant(variant.id)}
                                />
                            </div>
                        </td>
                    </tr>
                ))}
            </Table>

            <div className="w-full flex justify-center mt-2">
                <PrimaryButton icon={<Plus className="size-4" />} type="button" onClick={() => setIsAddingVariant(true)}>
                    Tambah
                </PrimaryButton>
            </div>

            <SectionTitle>Harga Spesial Pembelian dengan Jumlah Tertentu</SectionTitle>

            <Table
                isEmpty={product.discounts.length === 0} disableHeight={true}
                headers={['Min. Pembelian', 'Normal', 'Langganan', 'Aksi']}
            >
                {product.discounts.map((discount, index) => (
                    <tr key={index} className="hover:bg-slate-200">
                        <td>{discount.min_qty}</td>
                        <td>{formatPrice(discount.normal_price)}</td>
                        <td>{formatPrice(discount.customer_price)}</td>
                        <td>
                            <div className="flex gap-2 items-center">
                                <PrimaryButton
                                    styled={false}
                                    className="text-emerald-600"
                                    icon={<Pencil className="size-4" />}
                                    type="button"
                                    onClick={() => setIsEditingDiscount(discount.id)}
                                />
                                <PrimaryButton
                                    styled={false}
                                    className="text-emerald-600"
                                    icon={<Trash2 className="size-4" />}
                                    type="button"
                                    onClick={() => setIsRemovingDiscount(discount.id)}
                                />
                            </div>
                        </td>
                    </tr>
                ))}
            </Table>

            <div className="w-full flex justify-center mt-2">
                <PrimaryButton icon={<Plus className="size-4" />} type="button" onClick={() => setIsAddingDiscount(true)}>
                    Tambah
                </PrimaryButton>
            </div>

            {isAddingDiscount && (
                <AddEditDiscount
                    mode="Create" isOpen={isAddingDiscount} onClose={() => setIsAddingDiscount(false)}
                    product={product}
                />
            )}

            {isEditingDiscount && (
                <AddEditDiscount
                    mode="Edit" isOpen={isEditingDiscount} onClose={() => setIsEditingDiscount(null)}
                    discount={product.discounts.find(d => d.id === isEditingDiscount)}
                />
            )}

            {isRemovingDiscount && (
                <RemoveDiscount
                    isOpen={isRemovingDiscount} onClose={() => setIsRemovingDiscount(null)}
                    discount={product.discounts.find(d => d.id === isRemovingDiscount)}
                    product={product}
                />
            )}

            {isAddingVariant && (
                <AddEditVariant
                    mode="Create" isOpen={isAddingVariant} onClose={() => setIsAddingVariant(false)}
                    product={product}
                />
            )}

            {isEditingVariant && (
                <AddEditVariant
                    mode="Edit" isOpen={isEditingVariant} onClose={() => setIsEditingVariant(null)}
                    product={product}
                    variant={product.variants.find(v => v.id === isEditingVariant)}
                />
            )}

            {isRemovingVariant && (
                <RemoveVariant
                    isOpen={isRemovingVariant} onClose={() => setIsRemovingVariant(null)}
                    variant={product.variants.find(v => v.id === isRemovingVariant)}
                    product={product}
                />
            )}

            {printingVariant && (
                <PrintBarcode
                    isOpen={!!printingVariant}
                    onClose={() => setPrintingVariant(null)}
                    variant={printingVariant}
                    product={product}
                />
            )}

            {previewImage && (
                <Popup
                    title="Preview Gambar"
                    isOpen={!!previewImage}
                    onClose={() => setPreviewImage(null)}
                    className="max-w-lg"
                >
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-auto rounded-lg object-contain"
                    />
                </Popup>
            )}
        </Popup>
    );
}
