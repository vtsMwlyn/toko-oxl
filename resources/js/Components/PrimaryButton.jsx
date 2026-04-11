export default function PrimaryButton({
    className = '',
    disabled,
    loading,
    children,
    icon,
    styled = true,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `${styled && 'bg-emerald-600 px-2 py-1 text-white font-semibold'} text-center border-transparent rounded hover:brightness-125 disabled:opacity-25 cursor-pointer hover:brightness-120 transition-all flex items-center justify-center gap-1 ${
                disabled && 'opacity-50'} ${ loading && 'cursor-wait' } ` + className
            }
            disabled={disabled}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin mr-1"></div>
            ) : icon}
            <div className="mt-0.5">
                {children}
            </div>
        </button>
    );
}
