export const runtime = "nodejs";
import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

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

  const currentUser = await getCurrentUser(req);
  if (currentUser?.department === "Quality Control" && rows[0].department !== "Quality Control") {
    return Response.json(null);
  }

  return Response.json(rows[0]);
}
