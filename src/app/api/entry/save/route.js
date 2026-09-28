import { db } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const data = await req.json();
    const currentUser = await getCurrentUser(req);

    /* ================= BASIC VALIDATION ================= */

    if (!data.qr_id) {
      return NextResponse.json(
        { success: false, message: "QR ID is required" },
        { status: 400 }
      );
    }

    if (!data.InstRefNo || !data.InstRefNo.trim()) {
      return NextResponse.json(
        { success: false, message: "Ref No is required" },
        { status: 400 }
      );
    }

    /* ================= DUPLICATE REF NO CHECK ================= */

    const [dup] = await db.query(
      `SELECT qr_id FROM instrument_entries 
       WHERE InstRefNo = ? AND qr_id != ?`,
      [data.InstRefNo.trim(), data.qr_id]
    );

    if (dup.length > 0) {
      return NextResponse.json(
        { success: false, message: "Ref No already exists" },
        { status: 409 }
      );
    }

    /* ================= CHECK EXISTING RECORD ================= */

    const [rows] = await db.query(
      `SELECT ReviewDate, mail_status FROM instrument_entries WHERE qr_id = ?`,
      [data.qr_id]
    );

    const isUpdate = rows.length > 0;
    let mail_status = 1;

    /* ================= MAIL STATUS LOGIC ================= */

    if (isUpdate) {
      const oldReviewDate = rows[0].ReviewDate; // NULL or DATE
      const newReviewDate = data.ReviewDate?.trim() || null;

      // Only REAL change triggers mail
      if (oldReviewDate && newReviewDate && oldReviewDate !== newReviewDate) {
        mail_status = 2;
      } else {
        mail_status = rows[0].mail_status ?? 1;
      }
    }

    /* ================= UPDATE ================= */

    if (isUpdate) {
      const [result] = await db.query(
        `
        UPDATE instrument_entries SET
          InstrumentName = ?,
          InstRefNo = ?,
          Make = ?,
          Location = ?,
          InstRange = ?,
          LeastCount = ?,
          RangeOfUse = ?,
          CalibRange = ?,
          Frequency = ?,
          PerformedBy = ?,
          CalibDueOn = ?,
          FormNo = ?,
          EffectiveDate = ?,
          ReviewDate = ?,
          mail_status = ?
        WHERE qr_id = ?
        `,
        [
          data.InstrumentName || null,
          data.InstRefNo.trim(),
          data.Make || null,
          data.Location || null,
          data.InstRange || null,
          data.LeastCount || null,
          data.RangeOfUse || null,
          data.CalibRange || null,
          data.Frequency || null,
          data.PerformedBy || null,
          data.CalibDueOn || null,
          data.FormNo || null,
          data.EffectiveDate || null,
          data.ReviewDate || null,
          mail_status,
          data.qr_id,
        ]
      );

      return NextResponse.json({
        success: true,
        action: "updated",
        affectedRows: result.affectedRows,
      });
    }

    /* ================= INSERT ================= */

    const [result] = await db.query(
      `
      INSERT INTO instrument_entries (
        qr_id,
        InstrumentName,
        InstRefNo,
        Make,
        Location,
        InstRange,
        LeastCount,
        RangeOfUse,
        CalibRange,
        Frequency,
        PerformedBy,
        CalibDueOn,
        FormNo,
        EffectiveDate,
        ReviewDate,
        mail_status,
        department
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `,
      [
        data.qr_id,
        data.InstrumentName || null,
        data.InstRefNo.trim(),
        data.Make || null,
        data.Location || null,
        data.InstRange || null,
        data.LeastCount || null,
        data.RangeOfUse || null,
        data.CalibRange || null,
        data.Frequency || null,
        data.PerformedBy || null,
        data.CalibDueOn || null,
        data.FormNo || null,
        data.EffectiveDate || null,
        data.ReviewDate || null,
        1, // ALWAYS 1 for new entry
        currentUser?.department || "Quality Assurance",
      ]
    );

    return NextResponse.json({
      success: true,
      action: "inserted",
      insertId: result.insertId,
    });

  } catch (err) {
    console.error("SAVE ENTRY ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}