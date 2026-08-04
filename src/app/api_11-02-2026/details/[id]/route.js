export const runtime = "nodejs";

import { db } from "@/app/lib/db";

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

//   return Response.json({
//     requestedId: id,
//     totalRows: rows.length,
//     rows
//   });
  return Response.json(rows[0]);
}



export async function PUT(req, context) {
  const { params } = context;
  const { id } = await params;

  const body = await req.json();

  console.log("PUT ID:", id);
  console.log("PUT BODY:", body);

  const [result] = await db.query(
    `
    UPDATE instruments
    SET FormNo = ?, EffectiveDate = ?, ReviewDate = ?
    WHERE id = ?
    `,
    [body.FormNo, body.EffectiveDate, body.ReviewDate, id]
  );

  console.log("UPDATE RESULT:", result);

  if (result.affectedRows === 0) {
    return Response.json(
      { success: false, message: "No record updated" },
      { status: 404 }
    );
  }

  return Response.json({ success: true });
}


