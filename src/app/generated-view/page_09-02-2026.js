"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GeneratedView() {
  const [list, setList] = useState([]);

  useEffect(() => {
    fetch("/api/qr/list")
      .then(res => res.json())
      .then(data => setList(data));
  }, []);

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>Calibration</h2>
        <Link href="/" style={styles.menuItem}>Upload</Link>
        <Link href="/view" style={styles.menuItem}>View</Link>
        <Link href="/download" style={styles.menuItem}>Download</Link>
        <Link href="/generate" style={styles.menuItem}>Generate QR</Link>
        <Link href="/generated-view" style={styles.menuItemActive}>
          Generated QR Codes
        </Link>
        <Link href="/generate-download" style={styles.menuItem}>Generate QR Download</Link>
      </aside>

      {/* MAIN */}
      <main style={styles.container}>
        <h2 style={styles.title}>Generated QR Codes</h2>

        <div style={styles.grid}>
          {list.map((item) => (
            <div key={item.qr_id} style={styles.card}>
              <img
                src={item.qrCode}
                alt="QR"
                style={styles.qr}
              />

              <div style={{ marginTop: 10, fontSize: 13 }}>
                <b>ID:</b> {item.qr_id}
              </div>

              <Link
                href={`/entry/${item.qr_id}`}
                style={{
                  marginTop: 10,
                  display: "inline-block",
                  color: "#2563eb",
                  fontSize: 13,
                }}
              >
                Open Entry Form →
              </Link>
            </div>
          ))}
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
    padding: 30,
  },

  title: {
    marginBottom: 20,
    fontWeight: "bold",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
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
    width: 150,
    height: 150,
    border: "1px solid #ccc",
    padding: 5,
  },
};