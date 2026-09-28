"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import QRCode from "qrcode";
import type { CSSProperties } from "react";
import { UploadCloud, FileSpreadsheet } from "lucide-react";

import { v4 as uuidv4 } from "uuid";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

/* ✅ Define row type */
interface InstrumentRow {
  id: string;
  SrNo: string;
  InstrumentName: string;
  InstRefNo: string;
  Make: string;
  Location: string;
  InstRange: string;
  LeastCount: string;
  RangeOfUse: string;
  CalibRange: string;
  Frequency: string;
  PerformedBy: string;
  CalibDueOn: string | number;
  qrCode: string;
}

export default function Home() {
  /* ✅ FIX: typed state */
  const [rows, setRows] = useState<InstrumentRow[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  const formatDate = (
    value: string | number | null | undefined
  ): string => {
    if (!value) return "";
    if (typeof value === "number" && !isNaN(value)) {
      const date = new Date((value - 25569) * 86400 * 1000);
      return date.toLocaleDateString("en-GB");
    }
    return String(value);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploading(true);

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      range: 3,
      defval: "",
      header: [
        "SrNo",
        "InstrumentName",
        "InstRefNo",
        "Make",
        "Location",
        "InstRange",
        "LeastCount",
        "RangeOfUse",
        "CalibRange",
        "Frequency",
        "PerformedBy",
        "CalibDueOn",
      ],
    });

    const cleanData = jsonData.filter(
      (r: any) => r.InstrumentName && r.InstRefNo
    );


    const rowsWithQR: InstrumentRow[] = [];
    for (const row of cleanData as any[]) {
      const id = uuidv4(); // 🔒 SAME ID
      //const url = `https://hezekiah-architraved-superfantastically.ngrok-free.dev/details/${id}`;
      const url = `http://115.241.45.146:8009//details/${id}`;
      console.log(url);
      const qrCode = await QRCode.toDataURL(url);

      // 🔁 PUSH SAME ROW 4 TIMES
      for (let i = 0; i < 1; i++) {
        rowsWithQR.push({
          id,
          ...row,
          qrCode,
        });
      }
    }



    localStorage.setItem("excelData", JSON.stringify(rowsWithQR));

    try {
      const res = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rowsWithQR),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setUploadError(
          result.error || result.message || "Failed to save records to database"
        );
        setUploading(false);
        return;
      }

      setRows(rowsWithQR);
    } catch (err) {
      setUploadError("Something went wrong while uploading. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar />

      <div style={styles.mainCol}>
        <Header />
        <main style={styles.container}>
        <h1 style={styles.title}>Excel to QR Code Generator</h1>
        <p style={styles.subtitle}>
          Upload calibration Excel file. QR code will be generated for each instrument.
        </p>

        <label style={styles.uploadBox}>
          <div style={styles.uploadIconWrap}>
            <UploadCloud size={26} color="#fff" />
          </div>
          <div style={styles.uploadText}>
            {uploading ? "Uploading..." : "Select Excel File"}
          </div>
          <div style={styles.uploadHint}>Click to browse .xlsx or .xls file</div>
          <input
            type="file"
            accept=".xlsx,.xls"
            hidden
            disabled={uploading}
            onChange={handleFileUpload}
          />
        </label>

        {uploadError && (
          <div style={styles.errorBanner}>{uploadError}</div>
        )}

        {rows.length > 0 && (
          <div style={styles.resultHeader}>
            <FileSpreadsheet size={18} color="#2563eb" />
            <h3 style={styles.resultTitle}>Generated QR Codes ({rows.length})</h3>
          </div>
        )}

        <div style={styles.grid}>
          {rows.map((row, i) => (
            <div key={`${row.id}-${i}`} style={styles.card}>
              <div style={styles.cardHeader}>Record #{i + 1}</div>
              <div style={styles.cardDivider} />

              <div style={styles.content}>
                <div style={styles.left}>
                  <div><b>Instrument:</b> {row.InstrumentName}</div>
                  <div><b>Equipments No:</b> {row.InstRefNo}</div>
                  <div><b>Make:</b> {row.Make}</div>
                  <div><b>Location:</b> {row.Location}</div>
                  <div><b>Range:</b> {row.InstRange}</div>
                  <div><b>Least Count:</b> {row.LeastCount}</div>
                  <div><b>Use Range:</b> {row.RangeOfUse}</div>
                  <div><b>Calibration:</b> {row.CalibRange}</div>
                  <div><b>Frequency:</b> {row.Frequency}</div>
                  <div><b>Performed By:</b> {row.PerformedBy}</div>
                  <div><b>Due On:</b> {formatDate(row.CalibDueOn)}</div>
                </div>

                <img src={row.qrCode} alt="QR" style={styles.qr} />
              </div>
            </div>
          ))}
        </div>
        </main>
      </div>
    </div>
  );
}


const styles: Record<string, CSSProperties> = {
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
    padding: 36,
    overflowY: "auto",
  },

  title: {
    marginBottom: 6,
    fontWeight: 700,
    fontSize: 24,
    color: "#0f172a",
  },

  subtitle: {
    color: "#64748b",
    marginBottom: 28,
    fontSize: 14,
  },

  uploadBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 32,
    padding: "36px 48px",
    borderRadius: 20,
    border: "2px dashed #c7d2fe",
    background: "#fff",
    cursor: "pointer",
    maxWidth: 420,
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: "0 4px 16px rgba(37,99,235,0.06)",
  },

  uploadIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    boxShadow: "0 6px 18px rgba(37,99,235,0.35)",
  },

  uploadText: {
    fontWeight: 600,
    fontSize: 15,
    color: "#0f172a",
  },

  uploadHint: {
    fontSize: 12.5,
    color: "#94a3b8",
  },

  resultHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },

  errorBanner: {
    marginTop: 16,
    marginBottom: 8,
    maxWidth: 420,
    padding: "12px 16px",
    borderRadius: 12,
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    fontSize: 13.5,
    fontWeight: 600,
  },

  resultTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#0f172a",
    margin: 0,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: 20,
    marginTop: 8,
  },

  card: {
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    background: "#fff",
    padding: 18,
    boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
  },

  cardHeader: {
    fontWeight: 700,
    color: "#2563eb",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  cardDivider: {
    height: 1,
    background: "#f1f5f9",
    margin: "10px 0 14px",
  },

  content: {
    display: "flex",
    gap: 15,
  },

  left: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: "1.7",
    color: "#334155",
  },

  qr: {
    width: 130,
    height: 130,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 5,
  },
};