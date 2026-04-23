import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";

export default function BarcodeScannerTest({ barcode }) {
    const [value, setValue] = useState("");
    const [history, setHistory] = useState([]);

    const inputRef = useRef(null);
    const barcodeRef = useRef(null);

    useEffect(() => {
        inputRef.current.focus();

        // Render barcode
        JsBarcode(barcodeRef.current, barcode, {
            format: "EAN13",
            width: 4,          // thicker bars (key!)
            height: 150,       // taller
            margin: 30,        // quiet zone
            fontSize: 20,
            background: "#fff",
            lineColor: "#000",
        });
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && value.trim() !== "") {
            setHistory((prev) => [value, ...prev]);
            setValue("");
        }
    };

    const simulateScan = () => {
        setHistory((prev) => [barcode, ...prev]);
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-xl font-bold mb-4">
                Barcode Scanner Test (EAN-13)
            </h1>

            {/* Scanner Input */}
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Scan barcode here..."
                className="w-full border-2 border-gray-300 rounded p-3 text-lg focus:border-green-500 outline-none"
            />

            {/* Dummy Barcode Display */}
            <div className="mt-6 text-center">
                <p className="mb-2 font-semibold">Dummy Barcode:</p>
                <div className="w-full flex justify-center">
                    <svg ref={barcodeRef}></svg>
                </div>

                <button
                    onClick={simulateScan}
                    className="mt-3 px-4 py-2 bg-green-500 text-white rounded"
                >
                    Simulate Scan
                </button>
            </div>

            {/* Scan Results */}
            <div className="mt-6">
                <h2 className="font-semibold mb-2">Scan Result:</h2>

                {history.length === 0 && (
                    <p className="text-gray-400">No scans yet</p>
                )}

                <ul className="space-y-2">
                    {history.map((code, index) => (
                        <li
                            key={index}
                            className="p-2 border rounded bg-gray-50 font-mono"
                        >
                            {code}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
