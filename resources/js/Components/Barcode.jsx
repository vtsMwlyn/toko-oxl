import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export default function Barcode({ variant }) {
    const svgRef = useRef(null);

    useEffect(() => {
        if (svgRef.current) {
            JsBarcode(svgRef.current, variant.barcode, {
                format: "EAN13",
                width: 2,
                height: 60,
                displayValue: true,
            });
        }
    }, [variant.barcode]);

    return (
        <div>
            <svg className="w-40" ref={svgRef} data-barcode-id={variant.id}></svg>
        </div>
    );
}
