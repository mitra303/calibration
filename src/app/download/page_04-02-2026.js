"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";

export default function DownloadPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch("/api/instruments") // 👉 make sure this API exists
      .then((res) => res.json())
      .then((data) => setRows(data.rows || data));
  }, []);

  const downloadPDF = async () => {
  const pdf = new jsPDF("p", "mm", "a4");

  const qrSize = 35;          // QR size
  const gapX = 12;            // space between columns
  const gapY = 48;            // space between rows
  const startX = 20;
  const startY = 20;

  let x = startX;
  let y = startY;
  let col = 0; // 0 = left, 1 = right

  pdf.setFontSize(9); // 🔹 SMALL TEXT (important)

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // const qrValue = `${window.location.origin}/details/${row.id}`;
    // const qrImage = await QRCode.toDataURL(qrValue);

    // const baseUrl =
    // typeof window !== "undefined"
    //     ? window.location.origin
    //     : "https://hezekiah-architraved-superfantastically.ngrok-free.dev";
    // const qrValue = `https://hezekiah-architraved-superfantastically.ngrok-free.dev/details/${row.id}`;
    const qrValue = `http://115.241.45.146:8009//details/${row.id}`;
    // const qrValue = `${baseUrl}/details/${row.id}`;
    //console.log(qrValue);

    const qrImage = await QRCode.toDataURL(qrValue);

    

    // 🧩 QR
    pdf.addImage(qrImage, "PNG", x, y, qrSize, qrSize);

    // 🧩 Ref No (centered under QR)
    pdf.text(
      `Ref No: ${row.InstRefNo}`,
      x + qrSize / 2,
      y + qrSize + 3,
      { align: "center" }
    );

    // ➡ move to next column
    col++;

    if (col === 1) {
      x = startX + qrSize + gapX; // right column
    } else {
      // ⬇ next row
      col = 0;
      x = startX;
      y += gapY;
    }

    // 📄 new page if needed
    if (y > 250) {
      pdf.addPage();
      x = startX;
      y = startY;
      col = 0;
    }
  }

  pdf.save("Calibration_QR.pdf");
};


  return (
    <div style={{ padding: 30 }}>
      <h2>Download QR PDF</h2>

      <button onClick={downloadPDF} style={btnStyle}>
        Download PDF
      </button>
    </div>
  );
}

const btnStyle = {
  padding: "10px 20px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};
