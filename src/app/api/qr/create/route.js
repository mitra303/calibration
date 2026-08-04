import { db } from "@/app/lib/db";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export async function POST() {

function generateShortHexId() {
  const buf = crypto.randomBytes(6); // 12 hex chars total
  return `${buf.toString("hex").slice(0,8)}-${buf.toString("hex").slice(8,12)}`;
}

  //const qrId = uuidv4();
  const qrId = generateShortHexId();

   //const baseUrl =
     "https://hezekiah-architraved-superfantastically.ngrok-free.dev";
  const baseUrl = "http://115.241.45.146:8009";

  const qrUrl = `${baseUrl}/entry/${qrId}`;

  await db.query(
    `
    INSERT INTO instrument_entries (qr_id, qrCode)
    VALUES (?, ?)
    `,
    [qrId, qrUrl]
  );

  return Response.json({
    success: true,
    qrId,
    qrUrl,
  });
}
