import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Today@2026",    
      database: "calibration",
    });

    const [rows] = await connection.execute(
      "SELECT * FROM instruments"
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("DB ERROR:", error);
    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
}
