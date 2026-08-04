"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ViewPage() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`/api/view?page=${page}&limit=${limit}&search=${search}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("API Error");
          }
          return res.json();
        })
        .then((res) => {
          setRows(res.data || []);
          setTotal(res.total || 0);
        })
        .catch((err) => {
          console.error("Fetch Error:", err);
          setRows([]);
          setTotal(0);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [page, search]);

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    // Add 1 day
    date.setDate(date.getDate() + 1);

    return date.toISOString().split("T")[0];
  };

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>Calibration</h2>
        <Link href="/dashboard" style={styles.menuItem}>
          Upload
        </Link>
        <Link href="/view" style={styles.menuItemActive}>
          View
        </Link>
        <Link href="/download" style={styles.menuItem}>
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
        <h1 style={styles.title}>Generated Instrument Records</h1>

        {/* SEARCH */}
        <input
          placeholder="Search Instrument / Ref No / Make / Location"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={styles.search}
        />

        {rows.length === 0 ? (
          <p>No data found.</p>
        ) : (
          <>
            <div style={styles.grid}>
              {rows.map((row, rowIndex) =>
                Array.from({ length: 1 }).map((_, copyIndex) => (
                  <div key={`${row.id}-${copyIndex}`} style={styles.card}>
                    <div style={styles.cardHeader}>
                      Record #{rowIndex + 1 + (page - 1) * limit}
                    </div>

                    <div style={styles.content}>
                      <div style={styles.left}>
                        <div>
                          <b>Instrument:</b> {row.InstrumentName}
                        </div>
                        <div>
                          <b>Equipment No:</b> {row.InstRefNo}
                        </div>
                        <div>
                          <b>Make:</b> {row.Make}
                        </div>
                        <div>
                          <b>Location:</b> {row.Location}
                        </div>
                        <div>
                          <b>Range:</b> {row.InstRange}
                        </div>
                        <div>
                          <b>Least Count:</b> {row.LeastCount}
                        </div>
                        <div>
                          <b>Use Range:</b> {row.RangeOfUse}
                        </div>
                        <div>
                          <b>Calibration:</b> {row.CalibRange}
                        </div>
                        <div>
                          <b>Frequency:</b> {row.Frequency}
                        </div>
                        <div>
                          <b>Performed By:</b> {row.PerformedBy}
                        </div>
                        <div>
                          <b>Due On:</b> {formatDate(row.CalibDueOn)}
                        </div>
                      </div>

                      <img
                        src={row.qrCode}
                        alt="QR"
                        style={{ width: 130, height: 130 }}
                      />
                    </div>

                    <div style={styles.btnRow}>
                      <a
                        href={`http://115.241.45.146:8009/details/${row.id}`}
                        target="_blank"
                        style={styles.viewBtn}
                      >
                        View Details
                      </a>

                      <button
                        style={styles.deleteBtn}
                        onClick={async () => {
                          if (!confirm("Are you sure to delete?")) return;

                          await fetch(`/api/delete/${row.id}`, {
                            method: "DELETE",
                          });

                          window.location.reload();
                        }}
                      >
                        Delete
                      </button>
                    </div>


                  </div>
                )),
              )}
            </div>

            {/* PAGINATION */}
            <div style={styles.pagination}>
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                ◀ Previous
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next ▶
              </button>
            </div>
          </>
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
    color: "#111827",
  },

  title: {
    marginBottom: 20,
  },

  search: {
    width: "100%",
    maxWidth: 400,
    padding: 10,
    marginBottom: 20,
    borderRadius: 6,
    border: "1px solid #ccc",
    color: "#111827",
    background: "#fff",
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

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    marginTop: 25,
  },
  deleteBtn: {
    marginTop: 10,
    background: "red",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    cursor: "pointer",
    borderRadius: "4px",
  },

  viewBtn: {
    display: "inline-block",
    marginTop: 10,
    marginRight: 10,
    background: "#2563eb",
    color: "#fff",
    padding: "5px 10px",
    textDecoration: "none",
    borderRadius: "4px",
  },
  
  btnRow: {
    display: "flex",
    justifyContent: "space-between", // 👈 magic line
    alignItems: "center",
    marginTop: 10,
  },
};
