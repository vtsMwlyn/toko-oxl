export default function InputLabel({
    value,
    className = '',
    required = true,
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-medium text-gray-700 ` +
                className
            }
        >
            {value ? value : children}{required && <span className="text-red-500">*</span>}
        </label>
    );
}
