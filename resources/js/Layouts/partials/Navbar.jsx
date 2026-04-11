import { Menu, Bell } from 'lucide-react';

export default function Navbar({ title, onMenuClick }) {
    return (
        <header className="sticky top-0 z-10 px-4 md:px-6 h-14 flex items-center gap-4">

            {/* ── Hamburger (mobile only) ── */}
            <button
                onClick={onMenuClick}
                aria-label="Buka menu"
                className="lg:hidden text-emerald-500 hover:text-emerald-700 transition-colors"
            >
                <Menu size={22} />
            </button>

            {/* ── Page title ── */}
            <h1 className="text-base font-semibold text-emerald-900 truncate">
                {title}
            </h1>
        </header>
    );
}
