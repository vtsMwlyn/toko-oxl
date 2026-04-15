function EmptyTablePlaceholder({ cols, invertColor = false }){
    return (
        <tr className={invertColor ? 'bg-slate-100' : 'bg-white'}>
            <td colSpan={cols}>
                <p className="text-center">- Data Tidak Ditemukan -</p>
            </td>
        </tr>
    )
}

export default function Table({ headers, isEmpty = false, invertColor = false, children, className, disableHeight = false }){
    return (
        <div className={`text-sm w-full overflow-x-auto ${!disableHeight && 'h-[60vh]'} ${className}`}>
            <table className="w-full">
                <thead>
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {!isEmpty ? (
                        children
                    ) : (
                        <EmptyTablePlaceholder invertColor={invertColor} cols={headers.length} />
                    )}
                </tbody>
            </table>
        </div>
    )
}
