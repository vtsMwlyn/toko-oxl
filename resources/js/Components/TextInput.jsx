import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, onClick, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    const handleClick = type === 'date'
        ? (e) => { try { e.target.showPicker(); } catch {} onClick?.(e); }
        : onClick;

    return (
        <input
            {...props}
            type={type}
            onClick={handleClick}
            className={
                'rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-1 px-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed ' +
                className
            }
            ref={localRef}
        />
    );
});
