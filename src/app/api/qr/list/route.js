export const runtime = "nodejs";
import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(req) {
  const currentUser = await getCurrentUser(req);

  const isQC = currentUser?.department === "Quality Control";

  const [rows] = await db.query(
    `
    SELECT *
    FROM instrument_entries
    ${isQC ? "WHERE department = ?" : ""}
    ORDER BY id DESC
  `,
    isQC ? ["Quality Control"] : []
  );

  return Response.json(rows);
}