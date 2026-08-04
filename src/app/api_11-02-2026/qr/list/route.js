export const runtime = "nodejs";
import { db } from "@/app/lib/db";

export async function GET() {
  const [rows] = await db.query(`
    SELECT *
    FROM instrument_entries
    ORDER BY id DESC
  `);

  return Response.json(rows);
}