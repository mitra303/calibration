"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import jsPDF from "jspdf";

const ITEMS_PER_PAGE = 8;

/* ✅ DATA TYPE */
interface QRItem {
  react_key: string;
  qr_id?: string | null;
  qrCode?: string | null;
  InstRefNo?: string | null;
  CalibDueOn?: string | null;   // ✅ ADD THIS
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




  const getDisplayColor = (item: QRItem) => {
    return item.InstRefNo && item.InstRefNo.trim() !== ""
      ? "green"
      : "#000"; // or gray / default
  };

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
          .qr-layout { flex-direction: column !important; }
          .qr-sidebar {
            width: 100% !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
            padding: 12px !important;
          }
          .qr-sidebar h2 { width: 100%; margin-bottom: 4px !important; }
          .qr-sidebar a { flex: 1 1 auto; text-align: center; }
          .qr-container { padding: 16px !important; }
          .qr-filterbar { flex-direction: column !important; align-items: stretch !important; }
          .qr-filters-left { flex-wrap: wrap !important; }
          .qr-search, .qr-date { width: 100% !important; }
          .qr-pdf-btn { width: 100% !important; }
          .qr-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)) !important; gap: 12px !important; }
        }

        @media (max-width: 480px) {
          .qr-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .qr-card { padding: 10px !important; }
          .qr-filters-left { flex-direction: column !important; align-items: stretch !important; }
        }

      `}</style>

      <div style={styles.layout} className="qr-layout">
      {/* SIDEBAR */}
      <aside style={styles.sidebar} className="qr-sidebar">
        <h2 style={styles.logo}>Calibration</h2>
        <Link href="/dashboard" style={styles.menuItem}>Upload</Link>
        <Link href="/view" style={styles.menuItem}>View</Link>
        <Link href="/download" style={styles.menuItem}>Uploaded Download</Link>
        <Link href="/generate" style={styles.menuItem}>Generate QR</Link>
        <Link href="/generated-view" style={styles.menuItem}>
          Generated QR Codes
        </Link>
        <Link href="/generate-download" style={styles.menuItem}>
          Generate QR Download
        </Link>
        <Link href="/all-qr-records" style={styles.menuItemActive}>
          All QR Records Download
        </Link>
        <Link href="/logout" style={styles.menuItem}>Logout</Link>
      </aside>

      {/* MAIN */}
      <main style={styles.container} className="qr-container">
        <h2 style={styles.title}>Download Generated QR Codes</h2>

        {/* 🔍 SEARCH */}
        <div style={styles.filterBar} className="qr-filterbar">

          <div style={styles.filtersLeft} className="qr-filters-left">

            {/* SEARCH */}
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
            style={styles.pdfBtn}
            className="qr-pdf-btn"
          >
            {downloadingAll ? "Preparing PDF..." : "Download All QR (PDF)"}
          </button>

        </div>

        {list.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: 40, fontWeight: "bold" }}>
            No QR Code Found
          </p>
        ) : (
          <>
            <div style={styles.grid} className="qr-grid">
              {list.map(item => (
                <div key={item.react_key} style={styles.card} className="qr-card">
                  {item.qrCode && (
                    <img src={item.qrCode} alt="QR" style={styles.qr} />
                  )}
                  {/* <div style={{ fontSize: 12, marginTop: 6 }}>
                    ID: {item.qr_id}
                  </div> */}

                  <div style={{ marginTop: 6, fontSize: 12 }}>
                    <b>ID:</b>  <span style={{ color: getDisplayColor(item) }}>
                      {getDisplayId(item)}
                    </span>
                  </div>


                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    <button
                      onClick={() => downloadQR(item.qrCode, getDisplayId(item))}
                      style={styles.downloadBtn}
                    >
                      Download
                    </button>

                    <button
                      onClick={() => printQR(item.qrCode, getDisplayId(item))}
                      style={styles.printBtn}
                    >
                      Print
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
                >
                  ◀ Prev
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next ▶
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
    </>
  );
}

/* 🎨 STYLES */
const styles: { [key: string]: CSSProperties } = {
  layout: { display: "flex", minHeight: "100vh" },
  sidebar: {
    width: 220,
    background: "#1f2937",
    color: "#fff",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  logo: { textAlign: "center", marginBottom: 20, fontWeight: "bold" },
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
  container: { flex: 1, padding: 30 },
  title: { marginBottom: 10, fontWeight: "bold" },
  search: {
    padding: "10px 12px",
    width: 250,
    height: 38,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  pdfBtn: {
    height: 40,
    padding: "0 18px",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 20,
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: 8,
    background: "#fff",
    padding: 15,
    textAlign: "center",
  },
  qr: { width: "75px", height: "75px", border: "1px solid #ccc", padding: 5 },
  downloadBtn: {
    marginTop: 10,
    padding: "6px 12px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
  },
  printBtn: {
    marginTop: 10,
    padding: "6px 12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
  },
  pagination: {
    marginTop: 25,
    display: "flex",
    gap: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between", // left & right
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
    height: 38,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  resetBtn: {
    height: 38,
    padding: "0 16px",
    background: "#6b7280",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
  },
};