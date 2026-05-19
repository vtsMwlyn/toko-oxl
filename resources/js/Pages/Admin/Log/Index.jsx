import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useCallback } from 'react';

const roleBadge = {
    Admin: 'bg-emerald-100 text-emerald-700',
    User:  'bg-slate-100 text-slate-600',
};

const fieldLabels = {
    date:          'Date',
    time:          'Time',
    status:        'Status',
    customer_name: 'Customer',
    queue_number:  'Queue',
};

function formatDateTime(datetime) {
    const date = new Date(datetime.replace(' ', 'T'));

    const formattedDate = new Intl.DateTimeFormat('en-GB', {
        day:   'numeric',
        month: 'long',
        year:  'numeric',
    }).format(date);

    const formattedTime = new Intl.DateTimeFormat('en-GB', {
        hour:   '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);

    return [formattedDate, formattedTime];
}

function Avatar({ name }) {
    const initials = name
        ?.split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase() ?? '?';

    return (
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600 shrink-0">
            {initials}
        </div>
    );
}

function ReturnBadge() {
    return (
        <span className="ml-1 px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 text-rose-700 border border-rose-200">
            Return
        </span>
    );
}

function SectionLabel({ children }) {
    return (
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">
            {children}
        </p>
    );
}

function ChangesPills({ changes }) {
    const grouped = {
        fields:  changes?.filter(c => c.field && !c.type) ?? [],
        added:   changes?.filter(c => c.type === 'added') ?? [],
        removed: changes?.filter(c => c.type === 'removed') ?? [],
        updated: changes?.filter(c => c.type === 'updated') ?? [],
    };

    const hasChanges = Object.values(grouped).some(g => g.length > 0);
    if (!hasChanges) return null;

    return (
        <div className="border-t border-gray-100 pt-3 mt-1 flex flex-col gap-3">

            {grouped.fields.length > 0 && (
                <div>
                    <SectionLabel>Sale fields</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                        {grouped.fields.map(c => (
                            <span
                                key={`field-${c.field}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700 border border-violet-200"
                            >
                                {fieldLabels[c.field] ?? c.field}: {c.old} → {c.new}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {grouped.added.length > 0 && (
                <div>
                    <SectionLabel>Items added</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                        {grouped.added.map(c => (
                            <span
                                key={`added-${c.variant_id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700 border border-teal-200"
                            >
                                + {c.product_name ?? '?'} · {c.variant_name ?? '?'}
                                <span className="opacity-60 mx-0.5">qty {c.new?.qty}</span>
                                {c.new?.type === 'Return' && <ReturnBadge />}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {grouped.removed.length > 0 && (
                <div>
                    <SectionLabel>Items removed</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                        {grouped.removed.map(c => (
                            <span
                                key={`removed-${c.variant_id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200"
                            >
                                − {c.product_name ?? '?'} · {c.variant_name ?? '?'}
                                {c.old?.type === 'Return' && <ReturnBadge />}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {grouped.updated.length > 0 && (
                <div>
                    <SectionLabel>Items updated</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                        {grouped.updated.map(c => (
                            <span
                                key={`updated-${c.variant_id}-${c.field ?? ''}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 border border-sky-200"
                            >
                                {c.product_name ?? '?'} · {c.variant_name ?? '?'}
                                <span className="opacity-60 ml-0.5">{c.field}:</span> {c.old} → {c.new}
                            </span>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}

function LogCard({ log }) {
    const [date, time] = formatDateTime(log.created_at);

    return (
        <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
                <Avatar name={log.user.name} />
                <div className="flex-1 min-w-0">

                    {/* Header row */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-gray-800">{log.user.name}</span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${roleBadge[log.user.role] ?? roleBadge.User}`}>
                            {log.user.role}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">{date} · {time}</span>
                    </div>

                    {/* Message */}
                    <p className="text-sm text-gray-500 leading-relaxed">{log.message}</p>

                    {/* Changes */}
                    <ChangesPills changes={log.changes} />

                </div>
            </div>
        </div>
    );
}

export default function Index({ logs }) {
    const reload = useCallback(() => {
        router.reload({ only: ['logs'], preserveScroll: true, preserveState: true });
    }, []);

    useEffect(() => {
        const id = setInterval(reload, 10000);
        document.addEventListener('visibilitychange', reload);
        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', reload);
        };
    }, [reload]);

    return (
        <AuthenticatedLayout title="Log Aksi Sistem">
            <Head title="Log" />

            {logs.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">
                    Belum ada log aksi.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {logs.map((log, index) => (
                        <LogCard key={index} log={log} />
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
