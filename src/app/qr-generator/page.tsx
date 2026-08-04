"use client";

import { useState } from "react";
import QRCode from "qrcode";

export default function QRGeneratorPage() {
  const [url, setUrl] = useState("");
  const [qrImage, setQrImage] = useState("");

  const generateQRCode = async () => {
    if (!url) return;

    try {
      const qr = await QRCode.toDataURL(url);
      setQrImage(qr);
    } catch (error) {
      console.error("QR Generation Error:", error);
    }
  };

  const downloadQRCode = () => {
    if (!qrImage) return;

    const link = document.createElement("a");
    link.href = qrImage;
    link.download = "qr-code.png";
    link.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          QR Code Generator
        </h1>

        <input
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={generateQRCode}
          className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 hover:bg-blue-700 transition"
        >
          Generate QR
        </button>

        {qrImage && (
          <div className="mt-6 flex flex-col items-center">
            <img
              src={qrImage}
              alt="QR Code"
              className="w-60 h-60 border rounded-lg"
            />

            <button
              onClick={downloadQRCode}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Download QR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}