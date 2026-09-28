import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(req) {
  const currentUser = await getCurrentUser(req);
  const { searchParams } = new URL(req.url);

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  let query = `SELECT * FROM instruments`;

  const conditions = [];
  const values = [];

  // ✅ Date filter
  if (startDate && endDate) {
    conditions.push(`CalibDueOn BETWEEN ? AND ?`);
    values.push(startDate, endDate);
  }

  // ✅ Always filter deleted records
  conditions.push(`isDeleted = 0`);

  // ✅ QC users only see QC department data; QA sees everything
  if (currentUser?.department === "Quality Control") {
    conditions.push(`department = ?`);
    values.push("Quality Control");
  }

  // ✅ Attach WHERE safely
  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  const [rows] = await db.execute(query, values);

  return Response.json({ rows });
}
