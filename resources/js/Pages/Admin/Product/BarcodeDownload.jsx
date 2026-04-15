import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import PrimaryButton from "@/Components/PrimaryButton";
import { Download } from "lucide-react";

export default function BarcodeDownload({barcode}) {
    const svgRef = useRef(null);
    const [code, setCode] = useState(barcode);

    useEffect(() => {
        JsBarcode(svgRef.current, code, {
            format: "EAN13",
            width: 2,
            height: 100,
            displayValue: true,
        });
    }, [code]);

    const downloadPNG = () => {
        const svg = svgRef.current;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const link = document.createElement("a");
            link.download = `${code}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        };

        img.src =
            "data:image/svg+xml;base64," +
            btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div>
            <svg className="w-48" ref={svgRef}></svg>

            <PrimaryButton icon={<Download/>} type="button" onClick={downloadPNG}>
                Download
            </PrimaryButton>
        </div>
    );
}
