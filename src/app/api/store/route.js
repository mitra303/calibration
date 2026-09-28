export const runtime = "nodejs";

import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

/* Excel serial date → MySQL YYYY-MM-DD */
function excelDateToMySQLDate(serial) {
  if (!serial || isNaN(serial)) return null;

  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const date = new Date(excelEpoch.getTime() + serial * 86400000);
  return date.toISOString().split("T")[0];
}

/* Normalize a CalibDueOn cell to a valid MySQL date, or null if it isn't one
   (e.g. free text like "obsolete", "NA") so one bad row can't fail the whole batch */
function sanitizeCalibDueOn(value) {
  if (typeof value === "number") return excelDateToMySQLDate(value);
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value.trim());
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
  }
  return null;
}

export async function POST(req) {
  try {
    const currentUser = await getCurrentUser(req);
    const department = currentUser?.department || "Quality Assurance";
    const uploadedBy = currentUser?.name || currentUser?.email || "Unknown";
    const rows = await req.json();

    /* 🔐 Remove duplicate IDs (important when barcode copied multiple times) */
    const uniqueMap = new Map();
    rows.forEach((r) => {
      if (!uniqueMap.has(r.id)) {
        uniqueMap.set(r.id, r);
      }
    });

    const uniqueRows = Array.from(uniqueMap.values());

    if (uniqueRows.length === 0) {
      return Response.json({ success: false, message: "No data to insert" });
    }

    const sql = `
      INSERT INTO instruments (
        id, SrNo, InstrumentName, InstRefNo, Make, Location,
        InstRange, LeastCount, RangeOfUse, CalibRange,
        Frequency, PerformedBy, CalibDueOn, qrCode, FormNo, department,
        UploadedBy, UploadedAt
      ) VALUES ?
      ON DUPLICATE KEY UPDATE
        InstrumentName = VALUES(InstrumentName),
        InstRefNo = VALUES(InstRefNo),
        Make = VALUES(Make),
        Location = VALUES(Location),
        InstRange = VALUES(InstRange),
        LeastCount = VALUES(LeastCount),
        RangeOfUse = VALUES(RangeOfUse),
        CalibRange = VALUES(CalibRange),
        Frequency = VALUES(Frequency),
        PerformedBy = VALUES(PerformedBy),
        CalibDueOn = VALUES(CalibDueOn),
        qrCode = VALUES(qrCode),
        FormNo = VALUES(FormNo),
        UploadedBy = VALUES(UploadedBy),
        UploadedAt = VALUES(UploadedAt)
    `;
// MIPL-CA-001-07 FormNo
    const values = uniqueRows.map((r) => [
      r.id,
      r.SrNo || null,
      r.InstrumentName || null,
      r.InstRefNo || null,
      r.Make || null,
      r.Location || null,
      r.InstRange || null,
      r.LeastCount || null,
      r.RangeOfUse || null,
      r.CalibRange || null,
      r.Frequency || null,
      r.PerformedBy || null,
      sanitizeCalibDueOn(r.CalibDueOn),
      r.qrCode || null,
       "MIPL-CA-001-07",
      department,
      uploadedBy,
      new Date(),
    ]);

    await db.query(sql, [values]);

    return Response.json({
      success: true,
      inserted: uniqueRows.length,
    });
  } catch (error) {
    console.error("STORE ERROR:", error);
    return Response.json(
      { success: false, error: "Database insert failed" },
      { status: 500 }
    );
  }
}
