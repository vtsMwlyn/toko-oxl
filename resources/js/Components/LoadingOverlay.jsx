import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

export default function LoadingOverlay() {
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let showTimer;

        const startLoading = (event) => {
            const visit = event.detail.visit;

            // Partial reloads are background data fetches (visit.only is non-empty).
            // Only show the overlay for full navigations or form submissions.
            const isPartialReload = visit.only && visit.only.length > 0;
            const isFormSubmit    = visit.method !== 'get';

            if (isPartialReload && !isFormSubmit) return;

            // Small delay so instant navigations don't flash the overlay
            showTimer = setTimeout(() => {
                setLoading(true);
                // Trigger fade-in on next paint
                requestAnimationFrame(() => setVisible(true));
            }, 80);
        };

        const stopLoading = () => {
            clearTimeout(showTimer);
            setVisible(false);
            // Wait for fade-out transition before unmounting
            setTimeout(() => setLoading(false), 300);
        };

        const removeStart   = router.on('start',   startLoading);
        const removeFinish  = router.on('finish',  stopLoading);
        const removeError   = router.on('error',   stopLoading);
        const removeInvalid = router.on('invalid', stopLoading);
        const removeException = router.on('exception', stopLoading);

        return () => {
            clearTimeout(showTimer);
            removeStart();
            removeFinish();
            removeError();
            removeInvalid();
            removeException();
        };
    }, []);

    if (!loading) return null;

    return (
        <div
            className={`fixed inset-0 z-[99999] flex items-center justify-center transition-opacity duration-300 ${
                visible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(3px)' }}
        >
            {/* Card */}
            <div
                className={`flex flex-col items-center gap-4 bg-white rounded-2xl px-10 py-8 shadow-2xl transition-all duration-300 ${
                    visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}
            >
                {/* Spinner rings */}
                <div className="relative w-14 h-14">
                    {/* Outer ring */}
                    <span
                        className="absolute inset-0 rounded-full border-4 border-slate-100"
                    />
                    {/* Spinning arc */}
                    <span
                        className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-400 animate-spin"
                        style={{ animationDuration: '0.7s' }}
                    />
                </div>

                {/* Text */}
                <p className="text-sm font-semibold text-slate-600 tracking-wide select-none">
                    Memuat…
                </p>
            </div>
        </div>
    );
}
