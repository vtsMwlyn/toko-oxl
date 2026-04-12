import { Check } from "lucide-react"

export default function OperationSuccess({ type, message }){
    return (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500">
                <Check className="w-5 h-5 text-white" />
            </div>

            <div className="flex flex-col">
                <span className="text-sm font-semibold text-emerald-700">
                    Berhasil {type === 'Create' ? 'menambahkan' : (type === 'Edit' ? 'memperbaharui' : 'menghapus')}
                </span>
                <span className="text-sm text-emerald-600">
                    {message}
                </span>
            </div>
        </div>
    )
}
