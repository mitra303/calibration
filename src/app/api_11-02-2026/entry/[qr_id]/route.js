export const runtime = "nodejs";
import { db } from "@/app/lib/db";

export async function GET(req, context) {
  const { params } = context;
  const { qr_id } = await params; // ✅ FIX

  const [rows] = await db.query(
    "SELECT * FROM instrument_entries WHERE qr_id = ?",
    [qr_id]
  );

  if (rows.length === 0) {
    return Response.json(null);
  }

  return Response.json(rows[0]);
}
