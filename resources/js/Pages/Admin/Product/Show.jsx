import { Image, Plus, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

import Popup from "@/Components/Popup"
import PrimaryButton from "@/Components/PrimaryButton"
import Table from "@/Components/Table"
import SectionTitle from "@/Components/SectionTitle"

import AddEdit from "./Discount/AddEdit"
import Remove from "./Discount/Remove"
import BarcodeAction from "./BarcodeAction"

import formatPrice from "@/Helpers/formatPrice"

export default function Show({ isOpen, onClose, product }){
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [isRemoving, setIsRemoving] = useState(null);

    return (
        <Popup title="Detail Data Produk" isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="w-full flex items-start gap-10">
                <div className="w-44">
                    {product.image_url ? (
                        <img src={product.image_url} className="w-full h-44 rounded-lg object-cover border border-emerald-100" />
                    ) : (
                        <div className="w-full h-44 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-300 text-[10px] font-medium select-none">
                            <Image />
                        </div>
                    )}
                </div>
                <div className="w-2/3">
                    <div className="w-5/6 grid grid-cols-2 gap-4">
                        <div className="w-full grid">
                            <h2 className="font-semibold text-sm">Nama</h2>
                            <p>{product.name}</p>
                        </div>
                        <div className="w-full grid">
                            <h2 className="font-semibold text-sm">Varian</h2>
                            <p>{product.variant}</p>
                        </div>
                        <div className="w-full grid">
                            <h2 className="font-semibold text-sm">Kode</h2>
                            <p>{product.code}</p>
                        </div>
                        <div className="w-full grid">
                            <h2 className="font-semibold text-sm">Stok</h2>
                            <p>{product.stock}</p>
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

            <SectionTitle>Barcode</SectionTitle>

            <BarcodeAction product={product} />

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
                                    onClick={() => setIsEditing(discount.id)}
                                />
                                <PrimaryButton
                                    styled={false}
                                    className="text-emerald-600"
                                    icon={<Trash2 className="size-4" />}
                                    type="button"
                                    onClick={() => setIsRemoving(discount.id)}
                                />
                            </div>
                        </td>
                    </tr>
                ))}
            </Table>

            <div className="w-full flex justify-center mt-2">
                <PrimaryButton icon={<Plus className="size-4" />} type="button" onClick={() => setIsAdding(true)}>
                    Tambah
                </PrimaryButton>
            </div>

            {isAdding && (
                <AddEdit
                    mode="Create" isOpen={isAdding} onClose={() => setIsAdding(false)}
                    product={product}
                />
            )}

            {isEditing && (
                <AddEdit
                    mode="Edit" isOpen={isEditing} onClose={() => setIsEditing(null)}
                    discount={product.discounts.find(d => d.id === isEditing)}
                />
            )}

            {isRemoving && (
                <Remove
                    isOpen={isRemoving} onClose={() => setIsRemoving(null)}
                    discount={product.discounts.find(d => d.id === isRemoving)}
                    product={product}
                />
            )}
        </Popup>
    )
}
