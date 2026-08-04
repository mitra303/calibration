export const runtime = "nodejs";

import { db } from "@/app/lib/db";

/* Excel serial date → MySQL YYYY-MM-DD */
function excelDateToMySQLDate(serial) {
  if (!serial || isNaN(serial)) return null;

  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const date = new Date(excelEpoch.getTime() + serial * 86400000);
  return date.toISOString().split("T")[0];
}

export async function POST(req) {
  try {
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
        Frequency, PerformedBy, CalibDueOn, qrCode
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
        qrCode = VALUES(qrCode)
    `;

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
      typeof r.CalibDueOn === "number"
        ? excelDateToMySQLDate(r.CalibDueOn)
        : r.CalibDueOn || null,
      r.qrCode || null,
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
