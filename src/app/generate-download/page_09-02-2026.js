"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import jsPDF from "jspdf";

export default function GenerateQRDownload() {
  const [list, setList] = useState([]);

  useEffect(() => {
    fetch("/api/qr/list")
      .then(res => res.json())
      .then(data => {
        setList(data || []);
      })
      .catch(() => setList([]));
  }, []);

  const downloadQR = (qrCode, qrId) => {
    const a = document.createElement("a");
    a.href = qrCode;
    a.download = `QR_${qrId}.png`;
    a.click();
  };


const downloadAllPDF = () => {
  const pdf = new jsPDF("p", "mm", "a4");

  const marginX = 10;
  const marginY = 10;

  const qrSize = 38;
  const gapX = 6;
  const gapY = 8;

  const copiesPerRow = 4;
  const rowsPerPage = 6;

  let x = marginX;
  let y = marginY;
  let rowCount = 0;

  list.forEach((item, index) => {
    // 🟦 4 copies in same row
    for (let copy = 0; copy < copiesPerRow; copy++) {
      pdf.addImage(item.qrCode, "PNG", x, y, qrSize, qrSize);

      // 🔹 Small text below each QR
      pdf.setFontSize(8);
      pdf.text(item.qr_id, x + qrSize / 2, y + qrSize + 1, {
        align: "center",
      });

      x += qrSize + gapX;
    }

    // Move to next row
    x = marginX;
    y += qrSize + gapY;
    rowCount++;

    // 📄 New page after 6 rows (24 QR)
    if (rowCount === rowsPerPage) {
      pdf.addPage();
      x = marginX;
      y = marginY;
      rowCount = 0;
    }
  });

  pdf.save("QR_Copies.pdf");
};

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>Calibration</h2>
        <Link href="/" style={styles.menuItem}>Upload</Link>
        <Link href="/view" style={styles.menuItem}>View</Link>
        <Link href="/download" style={styles.menuItem}>Download</Link>
        <Link href="/generate" style={styles.menuItem}>Generate QR</Link>
        <Link href="/generated-view" style={styles.menuItem}>
          Generated View QR
        </Link>
        <Link href="/generate-download" style={styles.menuItemActive}>
          Generate QR Download
        </Link>
      </aside>

      {/* MAIN */}
      <main style={styles.container}>
        <h2 style={styles.title}>Download Generated QR Codes</h2>

        <button
          onClick={downloadAllPDF}
          disabled={list.length === 0}
          style={{
            marginBottom: 20,
            padding: "10px 16px",
            background: list.length === 0 ? "#9ca3af" : "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: list.length === 0 ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          Download All QR (PDF)
        </button>

        {list.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: 40, fontWeight: "bold" }}>
            No QR Code Generated
          </p>
        ) : (
          <div style={styles.grid}>
            {list.map(item => (
              <div key={item.qr_id} style={styles.card}>
                <img src={item.qrCode} alt="QR" style={styles.qr} />

                <div style={{ fontSize: 12, marginTop: 6 }}>
                  ID: {item.qr_id}
                </div>

                <button
                  onClick={() => downloadQR(item.qrCode, item.qr_id)}
                  style={styles.downloadBtn}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
  },

  sidebar: {
    width: 220,
    background: "#1f2937",
    color: "#fff",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

   logo: {
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },

  menuItem: {
    color: "#fff",
    textDecoration: "none",
    padding: 10,
    borderRadius: 6,
    background: "#374151",
  },

  menuItemActive: {
    color: "#fff",
    textDecoration: "none",
    padding: 10,
    borderRadius: 6,
    background: "#2563eb",
  },

  container: {
    flex: 1,
    padding: 30,
  },

  title: {
    marginBottom: 20,
    fontWeight: "bold",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 20,
  },

  card: {
    border: "1px solid #ddd",
    borderRadius: 8,
    background: "#fff",
    padding: 15,
    textAlign: "center",
  },

  qr: {
    width: 140,
    height: 140,
    border: "1px solid #ccc",
    padding: 5,
  },

  downloadBtn: {
    marginTop: 10,
    padding: "6px 12px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
  },
};