"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import DetailsModal from "@/app/components/DetailsModal";
import ConfirmModal from "@/app/components/ConfirmModal";
import { Search, Eye, Trash2, Gauge } from "lucide-react";

export default function ViewPage() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [goToPage, setGoToPage] = useState("");

  const limit = 6;
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
      <Sidebar />

      <div style={styles.mainCol}>
        <Header />
        {/* MAIN */}
        <main style={styles.container}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>Generated Instrument Records</h1>
          <span style={styles.totalBadge}>{total} Total Records</span>
        </div>

        {/* SEARCH */}
        <div style={styles.searchWrap}>
          <Search size={17} color="#94a3b8" style={styles.searchIcon} />
          <input
            placeholder="Search Instrument / Ref No / Make / Location"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={styles.search}
          />
        </div>

        {rows.length === 0 ? (
          <div style={styles.emptyState}>
            <Gauge size={30} color="#94a3b8" />
            <p style={styles.emptyText}>No data found.</p>
          </div>
        ) : (
          <>
            <div style={styles.grid}>
              {rows.map((row, rowIndex) =>
                Array.from({ length: 1 }).map((_, copyIndex) => (
                  <div key={`${row.id}-${copyIndex}`} style={styles.card}>
                    <div style={styles.cardTop}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                        <div style={styles.cardHeader}>
                          Record #{rowIndex + 1 + (page - 1) * limit}
                        </div>
                        {row.department && (
                          <div
                            style={{
                              ...styles.deptBadge,
                              color: row.department === "Quality Control" ? "#9333ea" : "#2563eb",
                              background: row.department === "Quality Control" ? "#faf5ff" : "#eff6ff",
                            }}
                          >
                            {row.department}
                          </div>
                        )}
                      </div>
                      <img
                        src={row.qrCode}
                        alt="QR"
                        style={styles.qr}
                      />
                    </div>

                    <div style={styles.instrumentName}>{row.InstrumentName || "—"}</div>

                    <div style={styles.detailGrid}>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Equipment No</span>
                        <span style={styles.detailValue}>{row.InstRefNo || "-"}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Make</span>
                        <span style={styles.detailValue}>{row.Make || "-"}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Location</span>
                        <span style={styles.detailValue}>{row.Location || "-"}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Range</span>
                        <span style={styles.detailValue}>{row.InstRange || "-"}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Least Count</span>
                        <span style={styles.detailValue}>{row.LeastCount || "-"}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Use Range</span>
                        <span style={styles.detailValue}>{row.RangeOfUse || "-"}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Calibration</span>
                        <span style={styles.detailValue}>{row.CalibRange || "-"}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Frequency</span>
                        <span style={styles.detailValue}>{row.Frequency || "-"}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Performed By</span>
                        <span style={styles.detailValue}>{row.PerformedBy || "-"}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Due On</span>
                        <span style={styles.detailValueDue}>{formatDate(row.CalibDueOn)}</span>
                      </div>
                    </div>

                    <div style={styles.uploadMeta}>
                      Uploaded by <b>{row.UploadedBy || "Unknown"}</b>
                      {row.UploadedAt && (
                        <> on {new Date(row.UploadedAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</>
                      )}
                    </div>

                    <div style={styles.btnRow}>
                      <button
                        onClick={() => setActiveId(row.id)}
                        style={styles.viewBtn}
                      >
                        <Eye size={14} />
                        View Details
                      </button>

                      <button
                        style={styles.deleteBtn}
                        onClick={() => setDeleteId(row.id)}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>


                  </div>
                )),
              )}
            </div>

            {/* PAGINATION */}
            <div style={styles.pagination}>
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                style={{
                  ...styles.pageBtn,
                  opacity: page === 1 ? 0.5 : 1,
                  cursor: page === 1 ? "not-allowed" : "pointer",
                }}
              >
                ◀ Previous
              </button>

              <span style={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                style={{
                  ...styles.pageBtn,
                  opacity: page === totalPages ? 0.5 : 1,
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next ▶
              </button>

              <form
                style={styles.goToForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  const n = parseInt(goToPage, 10);
                  if (!isNaN(n) && n >= 1 && n <= totalPages) {
                    setPage(n);
                  }
                  setGoToPage("");
                }}
              >
                <span style={styles.goToLabel}>Go to</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={goToPage}
                  onChange={(e) => setGoToPage(e.target.value)}
                  placeholder="Page"
                  style={styles.goToInput}
                />
                <button type="submit" style={styles.goToBtn}>
                  Go
                </button>
              </form>
            </div>
          </>
        )}
        </main>
      </div>

      {activeId && (
        <DetailsModal id={activeId} onClose={() => setActiveId(null)} />
      )}

      {deleteId && (
        <ConfirmModal
          title="Delete this record?"
          message="This action cannot be undone. The instrument record will be permanently removed."
          confirmLabel="Delete"
          loading={deleting}
          onCancel={() => setDeleteId(null)}
          onConfirm={async () => {
            setDeleting(true);
            try {
              await fetch(`/api/delete/${deleteId}`, { method: "DELETE" });
              window.location.reload();
            } finally {
              setDeleting(false);
            }
          }}
        />
      )}
    </div>
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
    padding: 36,
    color: "#0f172a",
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontWeight: 700,
    fontSize: 24,
  },

  totalBadge: {
    fontSize: 12.5,
    fontWeight: 700,
    color: "#2563eb",
    background: "#eff6ff",
    padding: "5px 12px",
    borderRadius: 999,
  },

  searchWrap: {
    position: "relative",
    width: "100%",
    maxWidth: 440,
    marginBottom: 28,
  },

  searchIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
  },

  search: {
    width: "100%",
    padding: "12px 16px 12px 40px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    color: "#0f172a",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
    outline: "none",
    boxSizing: "border-box",
  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "60px 0",
    color: "#94a3b8",
  },

  emptyText: {
    margin: 0,
    fontSize: 14,
    fontWeight: 500,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: 20,
  },

  card: {
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    background: "#fff",
    padding: 20,
    boxShadow: "0 2px 10px rgba(15,23,42,0.05)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  cardHeader: {
    fontWeight: 700,
    color: "#2563eb",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    background: "#eff6ff",
    padding: "4px 10px",
    borderRadius: 999,
  },

  deptBadge: {
    fontWeight: 600,
    fontSize: 10.5,
    padding: "3px 9px",
    borderRadius: 999,
  },

  instrumentName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 14,
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px 16px",
    paddingBottom: 16,
    borderBottom: "1px solid #f1f5f9",
    marginBottom: 14,
  },

  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },

  detailLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  detailValue: {
    fontSize: 13.5,
    color: "#334155",
    fontWeight: 500,
  },

  detailValueDue: {
    fontSize: 13.5,
    color: "#dc2626",
    fontWeight: 700,
  },

  uploadMeta: {
    fontSize: 11.5,
    color: "#94a3b8",
    marginBottom: 14,
  },

  qr: {
    width: 84,
    height: 84,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 4,
    background: "#fff",
  },

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 28,
    flexWrap: "wrap",
  },

  goToForm: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  goToLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 500,
  },

  goToInput: {
    width: 64,
    padding: "7px 10px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 13,
    outline: "none",
  },

  goToBtn: {
    padding: "7px 14px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },

  pageBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#fff",
    fontWeight: 500,
    fontSize: 13,
  },

  pageInfo: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 500,
  },

  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    padding: "8px 14px",
    cursor: "pointer",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: 13,
  },

  viewBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
    color: "#fff",
    padding: "8px 14px",
    border: "none",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },

  btnRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
};
