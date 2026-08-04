"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

const ITEMS_PER_PAGE = 8;

/* ✅ DATA TYPE */
interface QRItem {
  qr_id: string;
  qrCode: string;
  InstRefNo?: string | null;
}

export default function GeneratedView() {
  const [list, setList] = useState<QRItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  /* 📥 FETCH DATA */
  useEffect(() => {
    fetch("/api/qr/list")
      .then(res => res.json())
      .then(data => setList(data || []));
  }, []);

  /* 🔁 DISPLAY ID (InstRefNo > qr_id) */
  const getDisplayId = (item: QRItem) => {
    return item.InstRefNo && item.InstRefNo.trim() !== ""
      ? item.InstRefNo
      : item.qr_id;
  };

  const getDisplayColor = (item: QRItem) => {
    return item.InstRefNo && item.InstRefNo.trim() !== ""
      ? "green"
      : "#000"; // or gray / default
  };

  /* 🔍 SEARCH FILTER */
  const filteredList = useMemo(() => {
    return list.filter(item => {
      const value = getDisplayId(item).toLowerCase();
      return value.includes(search.toLowerCase());
    });
  }, [list, search]);

  /* 📄 PAGINATION */
  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);

  const paginatedList = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, page]);

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>Calibration</h2>
        <Link href="/dashboard" style={styles.menuItem}>Upload</Link>
        <Link href="/view" style={styles.menuItem}>View</Link>
        <Link href="/download" style={styles.menuItem}>Uploaded Download</Link>
        <Link href="/generate" style={styles.menuItem}>Generate QR</Link>
        <Link href="/generated-view" style={styles.menuItemActive}>
          Generated QR Codes
        </Link>
        <Link href="/generate-download" style={styles.menuItem}>
          Generate QR Download
        </Link>
        <Link href="/all-qr-records" style={styles.menuItem}>
          All QR Records Download
        </Link>
        <Link href="/logout" style={styles.menuItem}>Logout</Link>
      </aside>

      {/* MAIN */}
      <main style={styles.container}>
        <h2 style={styles.title}>Generated QR Codes</h2>

        {/* 🔍 SEARCH */}
        <input
          type="text"
          placeholder="Search by Instrument Ref / QR ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={styles.search}
        />

        {/* GRID */}
        <div style={styles.grid}>
          {paginatedList.map(item => (
            <div key={item.qr_id} style={styles.card}>
              <img src={item.qrCode} alt="QR" style={styles.qr} />

              <div style={{ marginTop: 10, fontSize: 13 }}>
                <b>ID:</b>  <span style={{ color: getDisplayColor(item)}}>
                  {getDisplayId(item)}
                </span>
              </div>

              <Link
                href={`/entry/${item.qr_id}`}
                style={styles.link}
              >
                Open Entry Form →
              </Link>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              style={styles.pageBtn}
            >
              ◀ Prev
            </button>

            <span style={{ fontSize: 14 }}>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              style={styles.pageBtn}
            >
              Next ▶
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

/* 🎨 STYLES */
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
    flexDirection: "column" as const,
    gap: 12,
  },

  logo: {
    textAlign: "center" as const,
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
    marginBottom: 15,
    fontWeight: "bold",
  },

  search: {
    padding: 10,
    width: 320,
    marginBottom: 20,
    borderRadius: 6,
    border: "1px solid #ccc",
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
    textAlign: "center" as const,
  },

  qr: {
    width: "70px",
    height: "70px",
    border: "1px solid #ccc",
    padding: 5,
  },

  link: {
    marginTop: 10,
    display: "inline-block",
    color: "#2563eb",
    fontSize: 13,
  },

  pagination: {
    marginTop: 25,
    display: "flex",
    gap: 15,
    alignItems: "center",
  },

  pageBtn: {
    padding: "6px 14px",
    borderRadius: 6,
    border: "1px solid #ccc",
    cursor: "pointer",
    background: "#f9fafb",
  },
};