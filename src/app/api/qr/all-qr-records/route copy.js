export const runtime = "nodejs";
import { db } from "@/app/lib/db";

export async function GET() {
  const [rows] = await db.query(`
SELECT
  CONCAT(
    COALESCE(ie.id, 'NOENTRY'),
    '_',
    COALESCE(i.id, 'NOINST')
  ) AS react_key,

  COALESCE(ie.qrCode, i.qrCode) AS qrCode,

  -- 🔑 FINAL InstRefNo (entry > instrument)
  COALESCE(ie.InstRefNo, i.InstRefNo) AS InstRefNo,

  -- 📦 INSTRUMENT DATA
  i.id             AS instrument_id,
  i.SrNo           AS instrument_srno,
  i.InstrumentName AS instrument_name,
  i.Make,
  i.Location,
  i.InstRange,
  i.LeastCount,
  i.RangeOfUse,
  i.CalibRange,
  i.Frequency,
  i.PerformedBy,
  i.CalibDueOn,
  i.FormNo,

  -- 📦 ENTRY DATA
  ie.id            AS entry_id,
  ie.qr_id,
  ie.EffectiveDate AS entry_effective_date,
  ie.ReviewDate    AS entry_review_date,
  ie.mail_status

FROM instruments i
LEFT JOIN instrument_entries ie
  ON i.InstRefNo = ie.InstRefNo

UNION ALL

SELECT
  CONCAT(
    COALESCE(ie.id, 'NOENTRY'),
    '_',
    COALESCE(i.id, 'NOINST')
  ) AS react_key,

  COALESCE(ie.qrCode, i.qrCode) AS qrCode,

  -- 🔑 SAME HERE
  COALESCE(ie.InstRefNo, i.InstRefNo) AS InstRefNo,

  i.id,
  i.SrNo,
  i.InstrumentName,
  i.Make,
  i.Location,
  i.InstRange,
  i.LeastCount,
  i.RangeOfUse,
  i.CalibRange,
  i.Frequency,
  i.PerformedBy,
  i.CalibDueOn,
  i.FormNo,

  ie.id,
  ie.qr_id,
  ie.EffectiveDate,
  ie.ReviewDate,
  ie.mail_status

FROM instruments i
RIGHT JOIN instrument_entries ie
  ON i.InstRefNo = ie.InstRefNo

ORDER BY InstRefNo;
  `);

  return Response.json(rows);
}