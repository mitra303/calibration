"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ViewPage() {
  const [rows, setRows] = useState([]);

//   useEffect(() => {
//     const data = localStorage.getItem("excelData");
//     if (data) setRows(JSON.parse(data));
//   }, []);

  useEffect(() => {
    fetch("/api/view")
        .then(res => {
        if (!res.ok) throw new Error("API error");
        return res.json();
        })
        .then(data => setRows(data))
        .catch(err => {
        console.error(err);
        setRows([]);
        });
    }, []);


  const formatDate = (value) => {
    if (!value) return "-";
    if (!isNaN(value)) {
      const date = new Date((value - 25569) * 86400 * 1000);
      return date.toLocaleDateString();
    }
    return value;
  };

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>Calibration</h2>

        <Link href="/" style={styles.menuItem}>Upload</Link>
        <Link href="/view" style={styles.menuItemActive}>View</Link>
        <Link href="/download" style={styles.menuItem}>Download</Link>
      </aside>

      <main style={styles.container}>
        <h1 style={styles.title}>Generated Instrument Records</h1>

        {rows.length === 0 ? (
          <p>No data found. Please upload Excel first.</p>
        ) : (
          <div style={styles.grid}>
            {rows.map((row, i) => (
              <div key={row.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  Record #{i + 1}
                </div>

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

                  {/* <img src={row.qrCode} alt="QR" style={styles.qr} /> */}

                  <img
                      src={row.qrCode}
                      alt="QR"
                      style={{
                        width: "130px",
                        height: "130px",
                      }}
                    />

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
    fontFamily: "Arial",
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
    background: "#fafafa",
    padding: 15,
  },

  cardHeader: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  content: {
    display: "flex",
    gap: 15,
    alignItems: "flex-start",
  },

  left: {
    flex: 1,
    fontSize: 14,
    lineHeight: "1.6",
  },

  qr: {
    width: 80,
    height: 80,
  },
};
