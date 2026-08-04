import { db } from "@/app/lib/db";

export async function POST(req) {
  const { qr_id, qrCode } = await req.json();

  await db.query(
    `
    UPDATE instrument_entries
    SET qrCode = ?
    WHERE qr_id = ?
    `,
    [qrCode, qr_id]
  );

  return Response.json({ success: true });
}
