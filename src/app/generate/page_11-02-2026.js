"use client";

import { useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";

export default function GenerateQR() {

  // ✅ STATES ALWAYS FIRST
  // const [qrImage, setQrImage] = useState("");
  // const [refNo, setRefNo] = useState("");
  const [qrList, setQrList] = useState([]);
  const [locked, setLocked] = useState(false);

  // ✅ FUNCTIONS AFTER STATES
  const generateQR = async () => {
    if (locked) return;

    setLocked(true);

    // const baseUrl =
      // "https://hezekiah-architraved-superfantastically.ngrok-free.dev";
	const baseUrl =
      "http://14.99.235.114:8009";

    const generatedQrs = [];

    for (let i = 0; i < 12; i++) {
      const res = await fetch("/api/qr/create", { method: "POST" });
      const data = await res.json();
      const qrId = data.qrId;

      const qrValue = `${baseUrl}/entry/${qrId}`;
      const qrImage = await QRCode.toDataURL(qrValue);

      // save image in DB
      await fetch("/api/qr/save-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qr_id: qrId,
          qrCode: qrImage,
        }),
      });

      generatedQrs.push({
        id: qrId,
        image: qrImage,
      });
    }

    setQrList(generatedQrs);
  };

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>Calibration</h2>
        <Link href="/" style={styles.menuItem}>Upload</Link>
        <Link href="/view" style={styles.menuItem}>View</Link>
        <Link href="/download" style={styles.menuItem}>Download</Link>
        <Link href="/generate" style={styles.menuItemActive}>
          Generate QR
        </Link>
        <Link href="/generated-view" style={styles.menuItem}>Generated QR Codes</Link>
        <Link href="/generate-download" style={styles.menuItem}>Generate QR Download</Link>
      </aside>

      {/* MAIN */}
      <main style={styles.container}>
        <h2 style={styles.title}>Generate QR Code</h2>

        <button
          onClick={generateQR}
          disabled={locked}
          style={{
            ...styles.menuItemActive,
            opacity: locked ? 0.6 : 1,
            cursor: locked ? "not-allowed" : "pointer",
          }}
        >
          {locked ? "QR Generated" : "Generate QR"}
        </button>

        {/* ✅ NEW MULTI-QR DISPLAY BLOCK */}
        {qrList.length > 0 && (
          <div style={{ marginTop: 30 }}>
            {qrList.map((qr, index) => (
              <div key={qr.id} style={{ marginBottom: 30 }}>
                <div style={{ fontWeight: "bold", marginBottom: 10 }}>
                  QR {index + 1} – ID: {qr.id}
                </div>

                <div style={{ display: "flex", gap: 15 }}>
                  {[1, 2, 3, 4].map((copy) => (
                    <div key={copy} style={{ textAlign: "center" }}>
                      <img src={qr.image} alt="QR Code" style={styles.qr} />
                      <div style={{ fontSize: 11 }}>Copy {copy}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


/* ================= STYLES ================= */

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
  },


  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: 20,
  },

  card: {
    border: "1px solid #ddd",
    borderRadius: 8,
    background: "#fff",
    padding: 15,
  },

  cardHeader: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  content: {
    display: "flex",
    gap: 15,
  },

  left: {
    flex: 1,
    fontSize: 14,
    lineHeight: "1.6",
  },

  qr: {
    width: 130,
    height: 130,
    border: "1px solid #ccc",
    padding: 5,
  },

};
