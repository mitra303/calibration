export const runtime = "nodejs";

import { db } from "@/app/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req, context) {

  // const id = params.id;
  // const [rows] = await db.query(
  //   "SELECT * FROM instruments"
  // );

  const { params } = context;
  const { id } = await params;

  const [rows] = await db.query(
    "SELECT * FROM instruments WHERE id = ?",
    [id]
  );

  if (rows.length === 0) {
    return Response.json(
      { message: "Record not found" },
      { status: 404 }
    );
  }

  const row = rows[0];

  const formatDate = (date) => {
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };
  // 🔥 FIX HERE
  if (row.EffectiveDate) {
    row.EffectiveDate = formatDate(row.EffectiveDate);
  }

  if (row.CalibDueOn) {
    row.CalibDueOn = formatDate(row.CalibDueOn);
  }

  return Response.json(rows[0]);
}



// import { cookies } from "next/headers";

export async function PUT(req, context) {
  try {
    const { params } = context;
    const { id } = await params;
    const body = await req.json();

    // ✅ correct cookie usage
    const cookieHeader = req.headers.get("cookie") || "";
    const cookiesObj = Object.fromEntries(
      cookieHeader.split("; ").map(c => {
        const [k, v] = c.split("=");
        return [k, decodeURIComponent(v)];
      })
    );

    const email = cookiesObj.userEmail;

    if (!email) {
      return Response.json(
        { success: false, message: "No email in cookie" },
        { status: 401 }
      );
    }

    const [result] = await db.query(
      `UPDATE instruments
   SET
      InstrumentName=?,
      InstRefNo=?,
      Make=?,
      Location=?,
      InstRange=?,
      LeastCount=?,
      RangeOfUse=?,
      CalibRange=?,
      Frequency=?,
      FormNo=?,
      EffectiveDate=?,
      CalibDueOn=?,
      PerformedBy=?,
      UpdatedBy=?
   WHERE id=?`,
      [
        body.InstrumentName,
        body.InstRefNo,
        body.Make,
        body.Location,
        body.InstRange,
        body.LeastCount,
        body.RangeOfUse,
        body.CalibRange,
        body.Frequency,

        body.FormNo,
        body.EffectiveDate,
        body.CalibDueOn,
        body.PerformedBy,

        email,
        id
      ]
    );

    return Response.json({
      success: true,
      updatedBy: email,
      result
    });

  } catch (error) {
    console.error("PUT ERROR:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}