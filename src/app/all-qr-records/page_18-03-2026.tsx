"use client";

import type { CSSProperties } from "react";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import jsPDF from "jspdf";

const ITEMS_PER_PAGE = 8;

/* ✅ DATA TYPE */
interface QRItem {
  react_key: string;     // ✅ ADD THIS
  qr_id?: string | null;
  qrCode?: string | null;
  InstRefNo?: string | null;
}

export default function GenerateQRDownload() {
  const [list, setList] = useState<QRItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchQRList = async () => {
    try {
      const res = await fetch("/api/qr/all-qr-records", {
        cache: "no-store", // 🔥 VERY IMPORTANT
      });
      const data = await res.json();
      console.log(data);
      setList(data || []);
    } catch {
      setList([]);
    }
  };

  useEffect(() => {
    fetchQRList();
  }, []);

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

  /* 🔍 SEARCH */
  const filteredList = useMemo(() => {
    return list.filter(item => {
      const value = (getDisplayId(item) || "").toLowerCase();
      return value.includes(search.toLowerCase());
    });
  }, [list, search]);

  /* 📄 PAGINATION */
  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);

  const paginatedList = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, page]);

  const downloadQR = (qrCode: string | null | undefined, qrId: string | null | undefined) => {
    if (!qrCode) return;

    const a = document.createElement("a");
    a.href = qrCode;
    a.download = `QR_${qrId ?? "unknown"}.png`;
    a.click();
  };

  // const downloadAllPDF = () => {
  //   const pdf = new jsPDF("p", "mm", "a4");

  //   const pageWidth = pdf.internal.pageSize.getWidth();   // ~210
  //   const pageHeight = pdf.internal.pageSize.getHeight(); // ~297

  //   const marginX = 8;
  //   const marginY = 10;

  //   const qrSize = 18;   // ~75px
  //   const gapX = 4;
  //   const gapY = 8;

  //   const itemsPerRow = 8;

  //   // 🔥 AUTO calculate rows per page
  //   const usableHeight = pageHeight - marginY * 2;
  //   const rowHeight = qrSize + gapY;
  //   const rowsPerPage = Math.floor(usableHeight / rowHeight);

  //   let x = marginX;
  //   let y = marginY;
  //   let col = 0;
  //   let row = 0;

  //   const getPdfText = (item: QRItem): string => {
  //     if (item?.InstRefNo?.trim()) return item.InstRefNo;
  //     if (item?.qr_id?.trim()) return item.qr_id;
  //     return "";
  //   };

  //   filteredList.forEach((item: QRItem) => {

  //     if (!item.qrCode) return; // ✅ Prevent TS error

  //     pdf.addImage(item.qrCode, "PNG", x, y, qrSize, qrSize);

  //     pdf.setFontSize(6);
  //     pdf.text(
  //       getPdfText(item),
  //       x + qrSize / 2,
  //       y + qrSize + 3,
  //       { align: "center" }
  //     );

  //     col++;
  //     x += qrSize + gapX;

  //     if (col === itemsPerRow) {
  //       col = 0;
  //       x = marginX;
  //       row++;
  //       y += rowHeight;
  //     }

  //     if (row === rowsPerPage) {
  //       pdf.addPage();
  //       x = marginX;
  //       y = marginY;
  //       row = 0;
  //       col = 0;
  //     }
  //   });

  //   pdf.save("QR_A4_FULL_PAGE.pdf");
  // };


const downloadAllPDF = () => {
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

  filteredList.forEach((item: QRItem, index: number) => {
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
};



// const downloadAllPDF = () => {
//   const pdf = new jsPDF("p", "mm", "a4");

//   const pageWidth = 210;
//   const pageHeight = 297;

//   const cols = 9;
//   const rows = 11;

//   // Slightly reduced margins for more space
//   const marginX = 5;
//   const marginY = 7;

//   const usableWidth = pageWidth - marginX * 2;
//   const usableHeight = pageHeight - marginY * 2;

//   const cellWidth = usableWidth / cols;
//   const cellHeight = usableHeight / rows;

//   // 🔥 Bigger QR (previously -6)
//   const qrSize = Math.min(cellWidth, cellHeight) - 3;

//   let col = 0;
//   let row = 0;

//   const getPdfText = (item: QRItem): string => {
//     if (item?.InstRefNo?.trim()) return item.InstRefNo;
//     if (item?.qr_id?.trim()) return item.qr_id;
//     return "";
//   };

//   filteredList.forEach((item: QRItem) => {
//     if (!item.qrCode) return;

//     const x = marginX + col * cellWidth + (cellWidth - qrSize) / 2;
//     const y = marginY + row * cellHeight;

//     pdf.addImage(item.qrCode, "PNG", x, y, qrSize, qrSize);

//     pdf.setFont("helvetica", "bold");
//     pdf.setFontSize(5.5);
//     pdf.text(
//       getPdfText(item),
//       x + qrSize / 2,
//       y + qrSize + 2.5,
//       { align: "center" }
//     );

//     col++;

//     if (col === cols) {
//       col = 0;
//       row++;
//     }

//     if (row === rows) {
//       pdf.addPage();
//       row = 0;
//       col = 0;
//     }
//   });

//   pdf.save("QR_A4_99_PER_PAGE.pdf");
// };

  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
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
      <main style={styles.container}>
        <h2 style={styles.title}>Download Generated QR Codes</h2>

        {/* 🔍 SEARCH */}
        <div style={styles.topBar}>
          {/* LEFT: SEARCH */}
          <input
            type="text"
            placeholder="Search by QR ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={styles.search}
          />

          {/* RIGHT: DOWNLOAD BUTTON */}
          <button
            onClick={downloadAllPDF}
            disabled={filteredList.length === 0}
            style={styles.pdfBtn}
          >
            Download All QR (PDF)
          </button>
        </div>

        {filteredList.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: 40, fontWeight: "bold" }}>
            No QR Code Found
          </p>
        ) : (
          <>
            <div style={styles.grid}>
              {paginatedList.map(item => (
                <div key={item.react_key} style={styles.card}>
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


                  <button
                    onClick={() => downloadQR(item.qrCode, item.qr_id)}
                    style={styles.downloadBtn}
                  >
                    Download
                  </button>
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
    padding: 10,
    width: 260,
    marginBottom: 15,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  pdfBtn: {
    marginBottom: 20,
    padding: "10px 16px",
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

};