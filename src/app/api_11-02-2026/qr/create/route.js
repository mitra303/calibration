import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import crypto from "crypto";

export async function POST() {
  try {

    function generateShortHexId() {
      const buf = crypto.randomBytes(6); // 12 hex chars
      return `${buf.toString("hex").slice(0,8)}-${buf.toString("hex").slice(8,12)}`;
    }

    const qrId = generateShortHexId();

    const baseUrl = "http://14.99.235.114:8009";
    const qrUrl = `${baseUrl}/entry/${qrId}`;

    await db.query(
      `
      INSERT INTO instrument_entries (qr_id, qrCode)
      VALUES (?, ?)
      `,
      [qrId, qrUrl]
    );

    return NextResponse.json({
      success: true,
      qrId,
      qrUrl,
    });

  } catch (error) {
    console.error("QR CREATE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}