import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import LoadingOverlay from '@/Components/LoadingOverlay';

export default function GuestLayout({ children }) {
    return (
        <>
            <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
                <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                    <div className="w-full flex justify-center mb-8">
                        <Link href="/">
                            <ApplicationLogo className="h-24 w-24 rounded-xl" />
                        </Link>
                    </div>

                    {children}
                </div>
            </div>
            <LoadingOverlay />
        </>
    );
}
