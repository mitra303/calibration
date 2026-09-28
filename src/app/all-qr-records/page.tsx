"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import ConfirmModal from "@/app/components/ConfirmModal";
import { Search, QrCode, Download, Printer, FileDown, Trash2 } from "lucide-react";

const ITEMS_PER_PAGE = 10;

/* ✅ DATA TYPE */
interface QRItem {
  react_key: string;
  qr_id?: string | null;
  qrCode?: string | null;
  InstRefNo?: string | null;
  CalibDueOn?: string | null;   // ✅ ADD THIS
  department?: string | null;
  instrument_id?: string | null;
}

// "MIPL/MG/76,87,77,78" -> "MIPL/MG/76,MIPL/MG/87,MIPL/MG/77,MIPL/MG/78"
// bare numbers/tokens after a comma inherit the prefix (everything up to
// the last "/") from the first full ID in the list
const expandSearchTerms = (raw: string): string => {
  const tokens = raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const prefixSource = tokens.find((t) => t.includes("/"));
  const prefix = prefixSource
    ? prefixSource.slice(0, prefixSource.lastIndexOf("/") + 1)
    : "";

  return tokens
    .map((t) => (t.includes("/") || !prefix ? t : prefix + t))
    .join(",");
};

export default function GenerateQRDownload() {
  const [list, setList] = useState<QRItem[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [goToPage, setGoToPage] = useState("");
  const [deleteItem, setDeleteItem] = useState<QRItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // only the current page's records (with QR images) are fetched from the
  // server now, instead of the entire dataset on every load
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(ITEMS_PER_PAGE),
        });
        if (search) params.set("search", expandSearchTerms(search));
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        const res = await fetch(`/api/qr/all-qr-records?${params.toString()}`, {
          cache: "no-store",
        });
        const json = await res.json();
        setList(json.data || []);
        setTotal(json.total || 0);
      } catch {
        setList([]);
        setTotal(0);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [page, search, startDate, endDate]);

  /* 🔁 DISPLAY ID (InstRefNo > qr_id) */
  const getDisplayId = (item: QRItem) => {
    if (item?.InstRefNo && item.InstRefNo.trim() !== "") {
      return item.InstRefNo;
    }
    if (item?.qr_id && item.qr_id.trim() !== "") {
      return item.qr_id;
    }
    return "N/A"; // 🔒 NEVER null
  };




  const hasInstRefNo = (item: QRItem) =>
    Boolean(item.InstRefNo && item.InstRefNo.trim() !== "");

  /* 📄 PAGINATION (server-side: `list` is already just this page's items) */
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // crops the QR's built-in quiet zone and composites the ID label below it
  const buildLabeledQR = (qrCode: string, id: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const srcCanvas = document.createElement("canvas");
        srcCanvas.width = img.naturalWidth;
        srcCanvas.height = img.naturalHeight;
        const srcCtx = srcCanvas.getContext("2d");
        if (!srcCtx) return reject(new Error("no 2d context"));
        srcCtx.drawImage(img, 0, 0);

        const { data } = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
        let minX = srcCanvas.width, minY = srcCanvas.height, maxX = 0, maxY = 0;

        for (let y = 0; y < srcCanvas.height; y++) {
          for (let x = 0; x < srcCanvas.width; x++) {
            const i = (y * srcCanvas.width + x) * 4;
            const isDark = data[i + 3] > 0 && (data[i] + data[i + 1] + data[i + 2]) / 3 < 200;
            if (isDark) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        if (maxX < minX || maxY < minY) {
          minX = 0; minY = 0; maxX = srcCanvas.width - 1; maxY = srcCanvas.height - 1;
        }

        // keep a small quiet zone so the QR still scans reliably
        const quiet = Math.round((maxX - minX) * 0.06);
        const cropX = Math.max(0, minX - quiet);
        const cropY = Math.max(0, minY - quiet);
        const cropW = Math.min(srcCanvas.width, maxX + quiet) - cropX;
        const cropH = Math.min(srcCanvas.height, maxY + quiet) - cropY;

        const canvasSize = 236; // 20mm x 20mm at 300 DPI (kept square so print maps 1:1)
        const labelHeight = 36;
        const qrSize = canvasSize - labelHeight;
        const qrOffsetX = (canvasSize - qrSize) / 2;

        const canvas = document.createElement("canvas");
        canvas.width = canvasSize;
        canvas.height = canvasSize;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no 2d context"));

        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(srcCanvas, cropX, cropY, cropW, cropH, qrOffsetX, 0, qrSize, qrSize);

        ctx.fillStyle = "#000";
        ctx.font = "bold 24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(id, canvasSize / 2, qrSize + labelHeight / 2 + 2);

        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = qrCode;
    });
  };

  const downloadQR = async (qrCode: string | null | undefined, id: string) => {
    if (!qrCode) return;

    const safeId = id.replace(/[\\/]/g, "-");
    const labeledUrl = await buildLabeledQR(qrCode, id);

    const a = document.createElement("a");
    a.href = labeledUrl;
    a.download = `QR_${safeId}.png`;
    a.click();
  };

  const printQR = async (qrCode: string | null | undefined, id: string) => {
    if (!qrCode) return;

    // open the tab synchronously (inside the click handler) so mobile
    // browsers still treat it as user-initiated; navigate it once the
    // labeled image is ready. Printing a real dedicated page (instead of
    // hiding/showing content on this page) is far more reliable on mobile.
    const printTab = window.open("", "_blank");
    if (!printTab) return;

    const labeledUrl = await buildLabeledQR(qrCode, id);

    const storageKey = `printQR_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(storageKey, labeledUrl);

    printTab.location.href = `/print-qr?key=${storageKey}`;
  };

  const downloadAllPDF = async () => {
    setDownloadingAll(true);
    try {
      const params = new URLSearchParams({ all: "true" });
      if (search) params.set("search", expandSearchTerms(search));
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/qr/all-qr-records?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      const allItems: QRItem[] = json.data || [];

      if (allItems.length === 0) return;

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 210;
      const pageHeight = 297;

      // ✅ FIXED GRID
      const cols = 9;
      const rows = 11;

      // ✅ SAFE PRINT MARGINS
      const marginX = 6;
      const marginY = 8;

      const usableWidth = pageWidth - marginX * 2;
      const usableHeight = pageHeight - marginY * 2;

      const cellWidth = usableWidth / cols;
      const cellHeight = usableHeight / rows;

      const qrSize = Math.min(cellWidth, cellHeight) - 6; // padding inside cell

      let col = 0;
      let row = 0;

      const getPdfText = (item: QRItem): string => {
        if (item?.InstRefNo?.trim()) return item.InstRefNo;
        if (item?.qr_id?.trim()) return item.qr_id;
        return "";
      };

      allItems.forEach((item: QRItem) => {
        if (!item.qrCode) return;

        const x = marginX + col * cellWidth + (cellWidth - qrSize) / 2;
        const y = marginY + row * cellHeight + 1;

        // QR
        pdf.addImage(item.qrCode, "PNG", x, y, qrSize, qrSize);

        // Text
        pdf.setFontSize(5.5);
        pdf.text(
          getPdfText(item),
          x + qrSize / 2,
          y + qrSize + 3,
          { align: "center" }
        );

        col++;

        if (col === cols) {
          col = 0;
          row++;
        }

        // New page after 99 QRs
        if (row === rows) {
          pdf.addPage();
          row = 0;
          col = 0;
        }
      });

      pdf.save("QR_A4_99_PER_PAGE.pdf");
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <>
      {/* RESPONSIVE STYLES (mobile/tablet) */}
      <style>{`
        @media (max-width: 900px) {
          .qr-container { padding: 16px !important; }
          .qr-filterbar { flex-direction: column !important; align-items: stretch !important; }
          .qr-filters-left { flex-wrap: wrap !important; }
          .qr-search, .qr-date { width: 100% !important; }
          .qr-pdf-btn { width: 100% !important; }
          .qr-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important; gap: 12px !important; }
        }

        @media (max-width: 480px) {
          .qr-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .qr-card { padding: 10px !important; }
          .qr-filters-left { flex-direction: column !important; align-items: stretch !important; }
        }

      `}</style>

      <div style={styles.layout} className="qr-layout">
      <Sidebar />

      <div style={styles.mainCol}>
        <Header />
        {/* MAIN */}
        <main style={styles.container} className="qr-container">
        <div style={styles.titleRow}>
          <h2 style={styles.title}>Download Generated QR Codes</h2>
          <span style={styles.totalBadge}>{total} Total</span>
        </div>

        {/* 🔍 SEARCH */}
        <div style={styles.filterBar} className="qr-filterbar">

          <div style={styles.filtersLeft} className="qr-filters-left">

            {/* SEARCH */}
            <div style={styles.searchWrap} className="qr-search-wrap">
              <Search size={16} color="#94a3b8" style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by QR ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={styles.search}
                className="qr-search"
              />
            </div>

            {/* FROM DATE */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              style={styles.dateInput}
              className="qr-date"
            />

            {/* TO DATE */}
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              style={styles.dateInput}
              className="qr-date"
            />

            {/* RESET */}
            <button
              onClick={() => {
                setSearch("");
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
              style={styles.resetBtn}
            >
              Reset
            </button>

          </div>

          {/* DOWNLOAD */}
          <button
            onClick={downloadAllPDF}
            disabled={total === 0 || downloadingAll}
            style={{
              ...styles.pdfBtn,
              opacity: total === 0 || downloadingAll ? 0.6 : 1,
              cursor: total === 0 || downloadingAll ? "not-allowed" : "pointer",
            }}
            className="qr-pdf-btn"
          >
            <FileDown size={16} />
            {downloadingAll ? "Preparing PDF..." : "Download All QR (PDF)"}
          </button>

        </div>

        {list.length === 0 ? (
          <div style={styles.emptyState}>
            <QrCode size={30} color="#94a3b8" />
            <p style={styles.emptyText}>No QR Code Found</p>
          </div>
        ) : (
          <>
            <div style={styles.grid} className="qr-grid">
              {list.map(item => (
                <div key={item.react_key} style={styles.card} className="qr-card">
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
                    {item.qrCode && (
                      <img src={item.qrCode} alt="QR" style={styles.qr} />
                    )}
                  </div>

                  <div style={styles.idRow}>
                    <span style={styles.idLabel}>ID</span>
                    <span
                      style={{
                        ...styles.idValue,
                        color: hasInstRefNo(item) ? "#16a34a" : "#334155",
                      }}
                    >
                      {getDisplayId(item)}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 6, justifyContent: "center", width: "100%" }}>
                    <button
                      onClick={() => downloadQR(item.qrCode, getDisplayId(item))}
                      style={styles.downloadBtn}
                      title="Download"
                    >
                      <Download size={13} />
                      Download
                    </button>

                    <button
                      onClick={() => printQR(item.qrCode, getDisplayId(item))}
                      style={styles.printBtn}
                      title="Print"
                    >
                      <Printer size={13} />
                    </button>

                    <button
                      onClick={() => setDeleteItem(item)}
                      style={styles.deleteBtn}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 📄 PAGINATION */}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    ...styles.pageBtn,
                    opacity: page === 1 ? 0.5 : 1,
                    cursor: page === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  ◀ Prev
                </button>
                <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
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
            )}
          </>
        )}
        </main>
      </div>

      {deleteItem && (
        <ConfirmModal
          title="Delete this QR record?"
          message="This action cannot be undone. The instrument and/or QR entry will be permanently removed."
          confirmLabel="Delete"
          loading={deleting}
          onCancel={() => setDeleteItem(null)}
          onConfirm={async () => {
            setDeleting(true);
            try {
              const params = new URLSearchParams();
              if (deleteItem.instrument_id) params.set("instrumentId", String(deleteItem.instrument_id));
              if (deleteItem.qr_id) params.set("qrId", deleteItem.qr_id);

              await fetch(`/api/qr/all-qr-records?${params.toString()}`, {
                method: "DELETE",
              });

              setList((prev) => prev.filter((i) => i.react_key !== deleteItem.react_key));
              setTotal((prev) => Math.max(0, prev - 1));
              setDeleteItem(null);
            } finally {
              setDeleting(false);
            }
          }}
        />
      )}
    </div>
    </>
  );
}

/* 🎨 STYLES */
const styles: { [key: string]: CSSProperties } = {
  layout: { display: "flex", minHeight: "100vh", background: "#f8fafc" },
  mainCol: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  container: { flex: 1, padding: 36 },

  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
    flexWrap: "wrap",
  },

  title: { margin: 0, fontWeight: 700, fontSize: 22, color: "#0f172a" },

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
  },

  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
  },

  search: {
    padding: "10px 12px 10px 34px",
    width: 200,
    height: 40,
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
    outline: "none",
    boxSizing: "border-box",
  },
  pdfBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 42,
    padding: "0 18px",
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
    gap: 18,
  },
  card: {
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    background: "#fff",
    padding: 18,
    textAlign: "center",
    boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
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
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  qr: { width: "75px", height: "75px", display: "block" },
  idRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  idLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  idValue: {
    fontSize: 13,
    fontWeight: 700,
  },
  downloadBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    flex: 1,
    padding: "7px 10px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },
  printBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    flexShrink: 0,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    flexShrink: 0,
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  pagination: {
    marginTop: 28,
    display: "flex",
    gap: 15,
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  pageBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#fff",
    fontWeight: 500,
    fontSize: 13,
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
  pageInfo: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 500,
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  filterBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    gap: 20
  },

  filtersLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12
  },

  dateInput: {
    padding: "10px 12px",
    height: 40,
    borderRadius: 10,
    border: "1px solid #e2e8f0",
  },
  resetBtn: {
    height: 40,
    padding: "0 16px",
    background: "#64748b",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },
};