import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const offset = (page - 1) * limit;

    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      // password: "",
      // database: "calibration_qr",
      password: "Today@2026",    
      database: "calibration",
    });

    /* -------- WHERE clause for search -------- */
    let whereClause = "";
    let params = [];

    if (search) {
      whereClause = `
        WHERE InstrumentName LIKE ?
        OR InstRefNo LIKE ?
        OR Make LIKE ?
        OR Location LIKE ?
      `;
      params = Array(4).fill(`%${search}%`);
    }

    /* -------- DATA QUERY -------- */
    const [rows] = await connection.query(
	  `
	  SELECT * FROM instruments
	  ${whereClause}
	  ORDER BY id DESC
	  LIMIT ${Number(limit)} OFFSET ${Number(offset)}
	  `,
	  params
	);

    /* -------- COUNT QUERY -------- */
    const [[{ total }]] = await connection.execute(
      `
      SELECT COUNT(*) as total
      FROM instruments
      ${whereClause}
      `,
      params
    );

    await connection.end();

    return NextResponse.json({
      data: rows,
      total,
      page,
      limit,
    });

  } catch (error) {
    console.error("DB ERROR:", error);
    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
}
