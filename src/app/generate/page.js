"use client";

import { useEffect, useState, useMemo } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import EntryFormModal from "@/app/components/EntryFormModal";
import ConfirmModal from "@/app/components/ConfirmModal";
import {
  QrCode,
  Sparkles,
  Search,
  FileEdit,
  Download,
  Trash2,
  FileDown,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function GenerateQR() {
  const [qrList, setQrList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeQrId, setActiveQrId] = useState(null);
  const [deleteQrId, setDeleteQrId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchList = () => {
    fetch("/api/qr/list")
      .then((res) => res.json())
      .then((data) => setQrList(data || []))
      .catch(() => setQrList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const getDisplayId = (item) =>
    item.InstRefNo && item.InstRefNo.trim() !== "" ? item.InstRefNo : item.qr_id;

  const hasInstRefNo = (item) =>
    Boolean(item.InstRefNo && item.InstRefNo.trim() !== "");

  const filteredList = useMemo(() => {
    return qrList.filter((item) =>
      getDisplayId(item).toLowerCase().includes(search.toLowerCase())
    );
  }, [qrList, search]);

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);

  const paginatedList = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, page]);

  const generateQR = async () => {
    setGenerating(true);

    const baseUrl = "http://115.241.45.146:8009";

    const res = await fetch("/api/qr/create", { method: "POST" });
    const data = await res.json();
    const qrId = data.qrId;

    const qrValue = `${baseUrl}/entry/${qrId}`;
    const qrImage = await QRCode.toDataURL(qrValue);

    await fetch("/api/qr/save-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qr_id: qrId, qrCode: qrImage }),
    });

    setQrList((prev) => [{ qr_id: qrId, qrCode: qrImage }, ...prev]);
    setGenerating(false);
    setPage(1);
  };

  const downloadQR = (qrCodeUrl, qrId) => {
    const a = document.createElement("a");
    a.href = qrCodeUrl;
    a.download = `QR_${qrId}.png`;
    a.click();
  };

  const downloadAllPDF = () => {
    setDownloadingAll(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");

      const marginX = 10;
      const marginY = 12;
      const qrSize = 20;
      const gapX = 4;
      const gapY = 28;
      const itemsPerRow = 8;

      let x = marginX;
      let y = marginY;
      let col = 0;

      pdf.setFontSize(7);

      filteredList.forEach((item) => {
        pdf.addImage(item.qrCode, "PNG", x, y, qrSize, qrSize);
        pdf.text(String(getDisplayId(item)), x + qrSize / 2, y + qrSize + 3, {
          align: "center",
        });

        col++;
        if (col < itemsPerRow) {
          x += qrSize + gapX;
        } else {
          col = 0;
          x = marginX;
          y += gapY;
        }

        if (y > 270) {
          pdf.addPage();
          x = marginX;
          y = marginY;
          col = 0;
        }
      });

      pdf.save("QR_Codes.pdf");
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar />

      <div style={styles.mainCol}>
        <Header />
        <main style={styles.container}>
          <div style={styles.titleRow}>
            <h2 style={styles.title}>Generate QR Codes</h2>
            <span style={styles.totalBadge}>{filteredList.length} Total</span>
          </div>
          <p style={styles.subtitle}>
            Generate a QR code, then fill its entry form, download, or remove it — all from here.
          </p>

          <div style={styles.toolbar}>
            <div style={styles.toolbarLeft}>
              <div style={styles.iconBadge}>
                <QrCode size={22} color="#fff" />
              </div>
              <div>
                <div style={styles.actionTitle}>Generate a new QR code</div>
                <div style={styles.actionHint}>One click creates a fresh, unique QR.</div>
              </div>
            </div>

            <button
              onClick={generateQR}
              disabled={generating}
              style={{
                ...styles.generateBtn,
                opacity: generating ? 0.6 : 1,
                cursor: generating ? "not-allowed" : "pointer",
              }}
            >
              {generating ? <span style={styles.spinner} /> : <Sparkles size={16} />}
              {generating ? "Generating..." : "Generate QR"}
            </button>
          </div>

          <div style={styles.topBar}>
            <div style={styles.searchWrap}>
              <Search size={16} color="#94a3b8" style={styles.searchIcon} />
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
            </div>

            <button
              onClick={downloadAllPDF}
              disabled={filteredList.length === 0 || downloadingAll}
              style={{
                ...styles.pdfBtn,
                opacity: filteredList.length === 0 || downloadingAll ? 0.6 : 1,
                cursor: filteredList.length === 0 || downloadingAll ? "not-allowed" : "pointer",
              }}
            >
              <FileDown size={16} />
              {downloadingAll ? "Preparing PDF..." : "Download All QR (PDF)"}
            </button>
          </div>

          {!loading && paginatedList.length === 0 ? (
            <div style={styles.emptyState}>
              <QrCode size={30} color="#94a3b8" />
              <p style={styles.emptyText}>No QR codes found.</p>
            </div>
          ) : (
            <>
              <div style={styles.grid}>
                {paginatedList.map((item) => (
                  <div key={item.qr_id} style={styles.card} className="gen-qr-card">
                    {item.department && (
                      <div
                        style={{
                          ...styles.deptBadge,
                          color: item.department === "Quality Control" ? "#9333ea" : "#2563eb",
                          background: item.department === "Quality Control" ? "#faf5ff" : "#eff6ff",
                        }}
                      >
                        {item.department}
                      </div>
                    )}

                    <div style={styles.qrWrap}>
                      <img src={item.qrCode} alt="QR" style={styles.qr} />
                    </div>

                    <div
                      style={{
                        ...styles.idPill,
                        color: hasInstRefNo(item) ? "#16a34a" : "#475569",
                        background: hasInstRefNo(item) ? "#f0fdf4" : "#f1f5f9",
                      }}
                    >
                      {getDisplayId(item)}
                    </div>

                    <button
                      onClick={() => setActiveQrId(item.qr_id)}
                      style={styles.entryBtn}
                    >
                      <FileEdit size={13} />
                      Open Entry Form
                    </button>

                    <div style={styles.btnRow}>
                      <button
                        onClick={() => downloadQR(item.qrCode, item.qr_id)}
                        style={styles.downloadBtn}
                        title="Download"
                      >
                        <Download size={14} />
                      </button>

                      <button
                        onClick={() => setDeleteQrId(item.qr_id)}
                        style={styles.deleteBtn}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    style={{
                      ...styles.pageBtn,
                      opacity: page === 1 ? 0.5 : 1,
                      cursor: page === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    ◀ Prev
                  </button>
                  <span style={styles.pageInfo}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    style={{
                      ...styles.pageBtn,
                      opacity: page === totalPages ? 0.5 : 1,
                      cursor: page === totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    Next ▶
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {activeQrId && (
        <EntryFormModal
          qrId={activeQrId}
          onClose={() => {
            setActiveQrId(null);
            fetchList();
          }}
        />
      )}

      {deleteQrId && (
        <ConfirmModal
          title="Delete this QR code?"
          message="This action cannot be undone. The QR code and any linked entry data will be permanently removed."
          confirmLabel="Delete"
          loading={deleting}
          onCancel={() => setDeleteQrId(null)}
          onConfirm={async () => {
            setDeleting(true);
            try {
              await fetch(`/api/qr/delete/${deleteQrId}`, { method: "DELETE" });
              setQrList((prev) => prev.filter((q) => q.qr_id !== deleteQrId));
              setDeleteQrId(null);
            } finally {
              setDeleting(false);
            }
          }}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .gen-qr-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(15,23,42,0.1);
          border-color: #c7d2fe;
        }
      `}</style>
    </div>
  );
}

/* ================= STYLES ================= */

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
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontWeight: 800,
    fontSize: 24,
    letterSpacing: "-0.02em",
    backgroundImage: "linear-gradient(135deg, #2563eb, #9333ea)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },

  totalBadge: {
    fontSize: 12.5,
    fontWeight: 700,
    color: "#16a34a",
    background: "#f0fdf4",
    padding: "5px 12px",
    borderRadius: 999,
  },

  subtitle: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 6,
    marginBottom: 24,
  },

  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    background: "linear-gradient(135deg, #eff6ff, #faf5ff)",
    border: "1px solid #e0e7ff",
    borderRadius: 20,
    padding: "18px 22px",
    boxShadow: "0 6px 20px rgba(79,70,229,0.06)",
    flexWrap: "wrap",
    marginBottom: 20,
  },

  toolbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    minWidth: 220,
  },

  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: 13,
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 6px 18px rgba(37,99,235,0.3)",
  },

  actionTitle: {
    fontWeight: 700,
    fontSize: 14.5,
    color: "#0f172a",
  },

  actionHint: {
    fontSize: 12.5,
    color: "#64748b",
    marginTop: 2,
  },

  generateBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "#fff",
    border: "none",
    padding: "12px 22px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
    fontWeight: 600,
    fontSize: 14,
    boxShadow: "0 8px 20px rgba(37,99,235,0.35)",
    whiteSpace: "nowrap",
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

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },

  searchWrap: {
    position: "relative",
    width: "100%",
    maxWidth: 340,
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
    boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
    outline: "none",
    boxSizing: "border-box",
  },

  pdfBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 20px",
    background: "linear-gradient(135deg, #dc2626, #ea580c)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
    boxShadow: "0 6px 18px rgba(220,38,38,0.25)",
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
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 20,
  },

  card: {
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    background: "#fff",
    padding: 20,
    textAlign: "center",
    boxShadow: "0 2px 12px rgba(15,23,42,0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },

  deptBadge: {
    fontWeight: 600,
    fontSize: 10.5,
    padding: "3px 9px",
    borderRadius: 999,
    marginBottom: 10,
  },

  qrWrap: {
    background: "#f8fafc",
    border: "1px solid #f1f5f9",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },

  qr: { width: "76px", height: "76px", display: "block" },

  idPill: {
    fontSize: 12.5,
    fontWeight: 700,
    padding: "5px 12px",
    borderRadius: 999,
    marginBottom: 16,
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  entryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    background: "linear-gradient(135deg, #2563eb, #9333ea)",
    color: "#fff",
    border: "none",
    padding: "9px 14px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 12.5,
    cursor: "pointer",
    width: "100%",
    marginBottom: 10,
    boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
  },

  btnRow: {
    display: "flex",
    gap: 8,
    width: "100%",
  },

  downloadBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: "8px",
    background: "#f0fdf4",
    color: "#16a34a",
    border: "1px solid #dcfce7",
    borderRadius: 9,
    cursor: "pointer",
  },

  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: "8px",
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fee2e2",
    borderRadius: 9,
    cursor: "pointer",
  },

  pagination: {
    marginTop: 28,
    display: "flex",
    gap: 15,
    justifyContent: "center",
    alignItems: "center",
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
};
