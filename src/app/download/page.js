"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { FileDown, Calendar, RotateCcw } from "lucide-react";

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

      const qrValue = `http://14.99.235.114:8009/details/${row.id}`;
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
    <>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <div style={styles.layout}>
      <Sidebar />

      <div style={styles.mainCol}>
        <Header />
        {/* MAIN */}
        <main style={styles.container}>
        <div style={styles.card}>
          <div style={styles.iconBadge}>
            <FileDown size={26} color="#fff" />
          </div>

          <h2 style={styles.title}>Upload QR code to download</h2>

          <p style={styles.subtitle}>
            Select calibration due date range to download QR codes
          </p>

          {/* DATE FILTER */}
          <div style={styles.dateContainer}>
            <div style={styles.field}>
              <label style={styles.label}>
                <Calendar size={13} /> Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                <Calendar size={13} /> End Date
              </label>
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
                {loading ? (
                  <span style={styles.spinner} />
                ) : (
                  <FileDown size={16} />
                )}
                {loading ? "Generating PDF..." : "Download QR PDF"}
            </button>

            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              style={styles.resetBtn}
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>
        </div>
        </main>
      </div>
    </div>
    </>
  );
}

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: "#f8fafc",
  },

  mainCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },

  container: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "60px 20px",
  },

card: {
  width: "100%",
  maxWidth: "600px",
  background: "#fff",
  padding: "40px",
  borderRadius: "20px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 35px rgba(15,23,42,0.08)",
},

  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    boxShadow: "0 6px 18px rgba(37,99,235,0.3)",
  },

  title: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "6px",
    color: "#0f172a",
  },

  subtitle: {
    color: "#64748b",
    marginBottom: "32px",
    fontSize: "14px",
  },

  dateContainer: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "32px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    flex: "1",
    minWidth: "200px",
    gap: "6px",
  },

  label: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12.5px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },

  input: {
    padding: "11px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    background: "#f8fafc",
    color: "#0f172a",
  },

  buttonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  downloadBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
    color: "#fff",
    border: "none",
    padding: "12px 22px",
    borderRadius: "10px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 6px 18px rgba(37,99,235,0.3)",
  },

  resetBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #e2e8f0",
    padding: "12px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  spinner: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
};
