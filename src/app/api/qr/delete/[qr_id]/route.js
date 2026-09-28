export const runtime = "nodejs";
import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function DELETE(req, { params }) {
  const { qr_id } = await params;

  if (!qr_id) {
    return Response.json({ error: "qr_id is required" }, { status: 400 });
  }

  const currentUser = await getCurrentUser(req);

  if (currentUser?.department === "Quality Control") {
    const [rows] = await db.query(
      "SELECT department FROM instrument_entries WHERE qr_id = ?",
      [qr_id]
    );

    if (rows.length === 0 || rows[0].department !== "Quality Control") {
      return Response.json(
        { error: "Not authorized to delete this record" },
        { status: 403 }
      );
    }
  }

  await db.query("DELETE FROM instrument_entries WHERE qr_id = ?", [qr_id]);

  return Response.json({ success: true });
}
