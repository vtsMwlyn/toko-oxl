import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

function ToastItem({ message, onDismiss }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        const showTimer = setTimeout(() => setVisible(true), 10);
        // Auto-dismiss after 3 s
        const hideTimer = setTimeout(() => {
            setVisible(false);
            setTimeout(onDismiss, 300);
        }, 3000);
        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, []);

    return (
        <div
            className={`flex items-center gap-3 bg-white border border-emerald-100 shadow-lg rounded-xl px-4 py-3 min-w-[220px] max-w-xs transition-all duration-300 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
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
        <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end">
            {messages.map(({ id, text }) => (
                <ToastItem key={id} message={text} onDismiss={() => onDismiss(id)} />
            ))}
        </div>
    );
}
