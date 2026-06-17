import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ paginator, search }) {
    if (!paginator || paginator.last_page <= 1) return null;

    const navigate = (url) => {
        if (!url) return;
        const page = new URL(url).searchParams.get('page');
        const params = {};
        if (page)   params.page   = page;
        if (search) params.search = search;
        router.get(paginator.path, params, { preserveState: true, preserveScroll: false });
    };

    const numberedLinks = paginator.links?.slice(1, -1) ?? [];

    return (
        <div className="flex items-center justify-between mt-4 px-1">
            <p className="text-xs text-slate-400">
                {paginator.from ?? 0}–{paginator.to ?? 0} dari {paginator.total} data
            </p>

            <div className="flex items-center gap-1">
                {/* Previous */}
                <button
                    type="button"
                    onClick={() => navigate(paginator.links?.[0]?.url)}
                    disabled={!paginator.links?.[0]?.url}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>

                {/* Numbered pages */}
                {numberedLinks.map((link, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => navigate(link.url)}
                        disabled={link.active || !link.url}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-colors
                            ${link.active
                                ? 'bg-emerald-600 text-white cursor-default'
                                : 'text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed'
                            }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}

                {/* Next */}
                <button
                    type="button"
                    onClick={() => navigate(paginator.links?.[paginator.links.length - 1]?.url)}
                    disabled={!paginator.links?.[paginator.links.length - 1]?.url}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
