import { db } from "@/app/lib/db";

function parseCookies(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  return Object.fromEntries(
    cookieHeader
      .split("; ")
      .filter(Boolean)
      .map((c) => {
        const idx = c.indexOf("=");
        return [c.slice(0, idx), decodeURIComponent(c.slice(idx + 1))];
      })
  );
}

export async function getCurrentUser(req) {
  const { userEmail } = parseCookies(req);
  if (!userEmail) return null;

  const [rows] = await db.query(
    "SELECT id, name, email, department FROM users WHERE email = ?",
    [userEmail]
  );

  return rows[0] || null;
}
