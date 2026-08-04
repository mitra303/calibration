import { NextResponse, NextRequest } from "next/server";
import mysql from "mysql2/promise";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ params ko await karo
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Today@2026",
      database: "calibration",
    });

    await connection.execute(
      `UPDATE instruments SET isDeleted = true WHERE id = ?`,
      [id]
    );

    await connection.end();

    return NextResponse.json({ message: "Soft deleted successfully" });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}