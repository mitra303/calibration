export const runtime = "nodejs";
import { db } from "@/app/lib/db";

function excelDateToMySQLDate(serial) {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const date = new Date(excelEpoch.getTime() + serial * 86400000);
  return date.toISOString().split("T")[0]; // ⛔ no time
}

export async function POST(req) {
  const rows = await req.json();

  const sql = `
    INSERT INTO instruments (
      id, SrNo, InstrumentName, InstRefNo, Make, Location,
      InstRange, LeastCount, RangeOfUse, CalibRange,
      Frequency, PerformedBy, CalibDueOn, qrCode
    ) VALUES ?
  `;

  const values = rows.map((r) => [
    r.id,
    r.SrNo,
    r.InstrumentName,
    r.InstRefNo,
    r.Make,
    r.Location,
    r.InstRange,
    r.LeastCount,
    r.RangeOfUse,
    r.CalibRange,
    r.Frequency,
    r.PerformedBy,
    typeof r.CalibDueOn === "number"
      ? excelDateToMySQLDate(r.CalibDueOn)
      : r.CalibDueOn,
    r.qrCode,
  ]);

  await db.query(sql, [values]);

  return Response.json({
    success: true,
    inserted: values.length,
  });
}
