import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";

export const generateReminderPdf = async (records) => {
  const filePath = path.join("Calibration-Due-Report.pdf");

  const doc = new PDFDocument({
    margin: 10,
    size: "A4",
  });

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  /* ---------- SAFE DATE FORMAT (NO TIMEZONE ISSUE) ---------- */
  const formatDateOnly = (dateInput) => {
    if (!dateInput) return "-";

    if (typeof dateInput === "string" && dateInput.includes("-")) {
      return dateInput.split("T")[0];
    }

    const d = new Date(dateInput);
    return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
  };

  /* ---------- TITLE ---------- */
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("Calibration Due Summary Report", { align: "center" })
    .moveDown(0.1);

  let recordPerPage = 0;

  for (let i = 0; i < records.length; i++) {
    const data = records[i];

    /* ---- PAGE BREAK AFTER 3 RECORDS ---- */
    // if (recordPerPage === 4) {
    //   doc.addPage();
    //   recordPerPage = 0;
    // }

    const pageBottom = doc.page.height - 40;
    const requiredSpace = 180;

    if (doc.y + requiredSpace > pageBottom) {
      doc.addPage();
    }


    const startY = doc.y;

    /* ---------- LEFT DETAILS ---------- */
    doc.fontSize(11).font("Helvetica");

    const lineGap = 14;

    const writeLine = (label, value) => {
      const labelWidth = 110; // fixed width for labels
      const currentY = doc.y;

      // Label bold
      doc
        .font("Helvetica-Bold")
        .text(label + ":", 40, currentY, { width: labelWidth });

      // Value normal
      doc
        .font("Helvetica")
        .text(value || "-", 40 + labelWidth, currentY);

      doc.moveDown(0.2); // controlled spacing
    };

    writeLine("Instrument", data.InstrumentName);
    writeLine("Ref No", data.InstRefNo);
    writeLine("Make", data.Make);
    writeLine("Location", data.Location);
    writeLine("Range", data.InstRange);
    writeLine("Least Count", data.LeastCount);
    writeLine("Calibration", data.CalibRange);
    writeLine("Frequency", data.Frequency);
    writeLine("Performed By", data.PerformedBy);
    writeLine("Cal Done", formatDateOnly(data.EffectiveDate));

    /* ---------- CAL DUE WITH SMART RED HIGHLIGHT ---------- */
    /* ---------- CAL DUE (ALIGNED + BACKGROUND FIXED) ---------- */

    const dueDate = formatDateOnly(data.DueDate);
    const today = new Date().toLocaleDateString("en-CA");

    const labelWidth = 110;
    const currentY = doc.y;

    if (dueDate < today) {

      // Background only for value area (not label)
      doc
        .rect(40 + labelWidth, currentY - 2, 120, 16)
        .fill("#ffe5e5");

      // Label (bold, black)
      doc
        .font("Helvetica-Bold")
        .fillColor("black")
        .text("Cal Due:", 40, currentY, { width: labelWidth });

      // Value (red)
      doc
        .font("Helvetica")
        .fillColor("red")
        .text(dueDate, 40 + labelWidth, currentY);

      doc.fillColor("black");

    } else {

      // Normal aligned output
      doc
        .font("Helvetica-Bold")
        .text("Cal Due:", 40, currentY, { width: labelWidth });

      doc
        .font("Helvetica")
        .text(dueDate, 40 + labelWidth, currentY);
    }

    doc.moveDown(0.2);

    /* ---------- QR CODE ---------- */
    const qrData = `
Instrument: ${data.InstrumentName}
RefNo: ${data.InstRefNo}
Due: ${dueDate}
    `;

    // const qrImage = await QRCode.toDataURL(qrData);
    // const base64Data = qrImage.replace(/^data:image\/png;base64,/, "");
    // const qrBuffer = Buffer.from(base64Data, "base64");

    // //  why not use this data.qrCode ?

    // doc.image(qrBuffer, 420, startY, {
    //   width: 80,
    // });


    // if (data.qrCode) {
    //   const base64Data = data.qrCode.replace(/^data:image\/png;base64,/, "");
    //   const qrBuffer = Buffer.from(base64Data, "base64");

    //   doc.image(qrBuffer, 420, startY, {
    //     width: 80,
    //   });
    // }

    /* ---------- DIVIDER ---------- */
    doc
      .moveTo(40, doc.y + 8)
      .lineTo(555, doc.y + 8)
      .stroke()
      .moveDown(1.5);

    recordPerPage++;
  }

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};