import { NextResponse, NextRequest } from "next/server";
import mysql from "mysql2/promise";
import { getCurrentUser } from "@/app/lib/auth";

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

    const currentUser = await getCurrentUser(req);

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Today@2026",
      database: "calibration",
    });

    if (currentUser?.department === "Quality Control") {
      const [rows]: any = await connection.execute(
        `SELECT department FROM instruments WHERE id = ?`,
        [id]
      );

      if (rows.length === 0 || rows[0].department !== "Quality Control") {
        await connection.end();
        return NextResponse.json(
          { error: "Not authorized to delete this record" },
          { status: 403 }
        );
      }
    }

    await connection.execute(
      `DELETE FROM instruments WHERE id = ?`,
      [id]
    );

    await connection.end();

    return NextResponse.json({ message: "Deleted successfully" });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}