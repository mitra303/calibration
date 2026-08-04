import { db } from "@/app/lib/db";

export async function GET() {
  const [rows] = await db.query(
    "SELECT id, InstRefNo FROM instruments"
  );

  return Response.json({ rows });
}
