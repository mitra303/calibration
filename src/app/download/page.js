"use client";

import { useState } from "react";
import Link from "next/link";
import jsPDF from "jspdf";
import QRCode from "qrcode";

export default function DownloadPage() {
  const [rows, setRows] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  // ===== Fetch Data =====
  const fetchData = async () => {
    let url = "/api/instruments";

    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    return data.rows || data;
  };

  // ===== Download PDF =====
  const downloadPDF = async () => {


    // ===== Validation =====

  if (startDate && !endDate) {
    alert("Please select End Date");
    return;
  }

  if (!startDate && endDate) {
    alert("Please select Start Date");
    return;
  }


    if (startDate && endDate) {

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (start > end) {
      alert("Start Date cannot be greater than End Date");
      return;
    }

    // if (start > today || end > today) {
    //   alert("Future dates are not allowed");
    //   return;
    // }
  }
    setLoading(true);

    const data = await fetchData();
    setRows(data);

    if (!data || data.length === 0) {
      alert("No records found for selected date range");
      setLoading(false);
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");

    const qrSize = 20;
    const gapX = 5;
    const gapY = 28;
    const startX = 10;
    const startY = 15;
    const maxPerRow = 8;

    let x = startX;
    let y = startY;
    let col = 0;

    pdf.setFontSize(7);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      const qrValue = `http://115.241.45.146:8009/details/${row.id}`;
      const qrImage = await QRCode.toDataURL(qrValue);

      // QR Image
      pdf.addImage(qrImage, "PNG", x, y, qrSize, qrSize);

      // Text (InstRefNo or ID)
      const text =
        row?.InstRefNo && row.InstRefNo.trim() !== "" ? row.InstRefNo : row.id;

      pdf.text(String(text), x + qrSize / 2, y + qrSize + 3, {
        align: "center",
      });

      col++;

      if (col < maxPerRow) {
        x += qrSize + gapX;
      } else {
        col = 0;
        x = startX;
        y += gapY;
      }

      // Page break
      if (y > 270) {
        pdf.addPage();
        x = startX;
        y = startY;
        col = 0;
      }
    }

    pdf.save("Upload_QR_Codes.pdf");

    setLoading(false);
  };

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>Calibration</h2>

        <Link href="/dashboard" style={styles.menuItem}>
          Upload
        </Link>
        <Link href="/view" style={styles.menuItem}>
          View
        </Link>

        <Link href="/download" style={styles.menuItemActive}>
          Uploaded Download
        </Link>

        <Link href="/generate" style={styles.menuItem}>
          Generate QR
        </Link>

        <Link href="/generated-view" style={styles.menuItem}>
          Generated QR Codes
        </Link>

        <Link href="/generate-download" style={styles.menuItem}>
          Generate QR Download
        </Link>

        <Link href="/all-qr-records" style={styles.menuItem}>
          All QR Records Download
        </Link>

        <Link href="/logout" style={styles.menuItem}>
          Logout
        </Link>
      </aside>

      {/* MAIN */}
      <main style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Upload QR code to download</h2>

          <p style={styles.subtitle}>
            Select calibration due date range to download QR codes
          </p>

          {/* DATE FILTER */}
          <div style={styles.dateContainer}>
            <div style={styles.field}>
              <label style={styles.label}>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div style={styles.buttonRow}>
             <button
                onClick={downloadPDF}
                disabled={loading}
                style={{
                  ...styles.downloadBtn,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Generating PDF..." : "Download QR PDF"}
            </button>

            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              style={styles.resetBtn}
            >
              Reset
            </button>
          </div>
        </div>
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
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "60px 20px",
    background: "#ffffff",
  },

card: {
  width: "100%",
  maxWidth: "650px",
  background: "linear-gradient(135deg, #ffffff, #eef2ff)",
  padding: "35px",
  borderRadius: "12px",
  border: "1px solid #e0e7ff",
  boxShadow: "0 10px 25px rgba(37,99,235,0.15)",
},

  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "8px",
  },

  subtitle: {
    color: "#6b7280",
    marginBottom: "30px",
    fontSize: "14px",
  },

  dateContainer: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "30px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    flex: "1",
    minWidth: "200px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "6px",
  },

  input: {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
  },

  buttonRow: {
    display: "flex",
    gap: "15px",
  },

  downloadBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "11px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "500",
  },

  resetBtn: {
    background: "#e5e7eb",
    border: "none",
    padding: "11px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },
};
