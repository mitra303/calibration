import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  const data = await req.json();

  const sql = `
    INSERT INTO instrument_entries (
      qr_id, InstrumentName, InstRefNo, Make, Location,
      InstRange, LeastCount, RangeOfUse, CalibRange,
      Frequency, PerformedBy, CalibDueOn,
      FormNo, EffectiveDate, ReviewDate
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
      InstrumentName=VALUES(InstrumentName),
      InstRefNo=VALUES(InstRefNo),
      Make=VALUES(Make),
      Location=VALUES(Location),
      InstRange=VALUES(InstRange),
      LeastCount=VALUES(LeastCount),
      RangeOfUse=VALUES(RangeOfUse),
      CalibRange=VALUES(CalibRange),
      Frequency=VALUES(Frequency),
      PerformedBy=VALUES(PerformedBy),
      CalibDueOn=VALUES(CalibDueOn),
      FormNo=VALUES(FormNo),
      EffectiveDate=VALUES(EffectiveDate),
      ReviewDate=VALUES(ReviewDate)
  `;

  await db.query(sql, [
    data.qr_id,
    data.InstrumentName,
    data.InstRefNo,
    data.Make,
    data.Location,
    data.InstRange,
    data.LeastCount,
    data.RangeOfUse,
    data.CalibRange,
    data.Frequency,
    data.PerformedBy,
    data.CalibDueOn,
    data.FormNo,
    data.EffectiveDate,
    data.ReviewDate,
  ]);

  return NextResponse.json({ success: true });
}
