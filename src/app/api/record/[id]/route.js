export const runtime = "nodejs";

import { db } from "@/app/lib/db";

export async function GET(req, { params }) {
  const [rows] = await db.query(
    "SELECT * FROM instruments WHERE id = ?",
    [params.id]
  );

  if (rows.length === 0) {
    return new Response(
      JSON.stringify({ error: "Record not found" }),
      { status: 404 }
    );
  }

  return Response.json(rows[0]);
}
