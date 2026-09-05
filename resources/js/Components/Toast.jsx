import { useEffect, useState } from 'react';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';

function ToastItem({ message, type = 'success', onDismiss }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        const showTimer = setTimeout(() => setVisible(true), 10);
        // Auto-dismiss after 3 s
        const hideTimer = setTimeout(() => {
            setVisible(false);
            setTimeout(onDismiss, 300);
        }, 5000); // 5 seconds for better readability of errors
        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, []);

    const isError = type === 'error';

    return (
        <div
            className={`flex items-center gap-3 bg-white border shadow-lg rounded-xl px-4 py-3 min-w-[220px] max-w-sm transition-all duration-300 ${
                isError ? 'border-rose-200' : 'border-emerald-100'
            } ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
            {isError ? (
                <AlertCircle size={18} className="text-rose-500 shrink-0" />
            ) : (
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
            )}
            <p className="text-sm text-slate-700 flex-1">{message}</p>
            <button
                onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
                className="text-slate-300 hover:text-slate-500 transition-colors shrink-0"
            >
                <X size={14} />
            </button>
        </div>
    );
}

export default function Toast({ messages, onDismiss }) {
    if (!messages.length) return null;

    return (
        <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
            {messages.map(({ id, text, type }) => (
                <div key={id} className="pointer-events-auto">
                    <ToastItem message={text} type={type} onDismiss={() => onDismiss(id)} />
                </div>
            ))}
        </div>
    );
}
