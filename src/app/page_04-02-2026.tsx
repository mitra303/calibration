"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import QRCode from "qrcode";
import Link from "next/link";
import type { CSSProperties } from "react";

import { v4 as uuidv4 } from "uuid";

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

    /* ✅ FIX: typed array */
    const rowsWithQR: InstrumentRow[] = await Promise.all(
      cleanData.map(async (row: any) => {
        const id = uuidv4();
        // const url = `https://hezekiah-architraved-superfantastically.ngrok-free.dev/details/${id}`;
        const url = `http://14.99.235.114:8009//details/${id}`;
        const qrCode = await QRCode.toDataURL(url);
        return { id, ...row, qrCode };
      })
    );

    localStorage.setItem("excelData", JSON.stringify(rowsWithQR));

    await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rowsWithQR),
    });

    setRows(rowsWithQR);
  };

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>Calibration</h2>
        <Link href="/" style={styles.menuItem}>Upload</Link>
        <Link href="/view" style={styles.menuItem}>View</Link>
        <Link href="/download" style={styles.menuItem}>Download</Link>
      </aside>

      <main style={styles.container}>
        <h1>Excel to QR Code Generator</h1>
        <p style={styles.subtitle}>
          Upload calibration Excel file. QR code will be generated for each instrument.
        </p>

        <div style={styles.uploadBox}>
          <label style={styles.uploadBtn}>
            Select Excel File
            <input
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {rows.length > 0 && (
          <h3>Generated QR Codes ({rows.length})</h3>
        )}

        <div style={styles.grid}>
          {rows.map((row, i) => (
            <div key={row.id} style={styles.card}>
              <div style={styles.cardHeader}>Record #{i + 1}</div>

              <div style={styles.content}>
                <div style={styles.left}>
                  <div><b>Instrument:</b> {row.InstrumentName}</div>
                  <div><b>Ref No:</b> {row.InstRefNo}</div>
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
  );
}

/* ===== STYLES ===== */

const styles: Record<string, CSSProperties> = {
  layout: {
    display: "flex",
    height: "100vh",
  },
  sidebar: {
    width: 220,
    background: "#1f2937",
    color: "#fff",
    padding: 20,
    display: "flex",
    flexDirection: "column", // ✅ now correctly typed
    gap: 12,
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  menuItem: {
    color: "#fff",
    textDecoration: "none",
    padding: "8px 0",
  },
  container: {
    flex: 1,
    padding: 24,
    overflowY: "auto",
  },
  uploadBox: {
    marginTop: 20,
    marginBottom: 20,
  },
  uploadBtn: {
    background: "#2563eb",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 6,
    cursor: "pointer",
    display: "inline-block",
  },
  subtitle: {
    color: "#6b7280",
  },
  hint: {
    marginTop: 10,
    color: "#6b7280",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 16,
    marginTop: 20,
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 16,
  },
  cardHeader: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  content: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
  },
  left: {
    fontSize: 14,
  },
  qr: {
    width: 120,
    height: 120,
  },
};
