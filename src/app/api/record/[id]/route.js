export const runtime = "nodejs";

import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

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

  const currentUser = await getCurrentUser(req);
  if (currentUser?.department === "Quality Control" && rows[0].department !== "Quality Control") {
    return new Response(
      JSON.stringify({ error: "Record not found" }),
      { status: 404 }
    );
  }

  return Response.json(rows[0]);
}
