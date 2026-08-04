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
      password: "Today@2026",
      database: "calibration",
    });

    /* -------- WHERE clause for search -------- */
    let whereClause = `WHERE isDeleted = false`;
    let params = [];

    // if (search) {
    //   whereClause += `
    //     AND (
    //       InstrumentName LIKE ?
    //       OR InstRefNo LIKE ?
    //       OR Make LIKE ?
    //       OR Location LIKE ?
    //     )
    //   `;
    //   params = Array(4).fill(`%${search}%`);
    // }

    if (search) {
      const searchValues = search
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);

      const fullValues = [];
      let prefix = "";

      searchValues.forEach((item, index) => {
        if (item.includes("/")) {
          fullValues.push(item);

          if (index === 0) {
            const parts = item.split("/");
            prefix = `${parts[0]}/${parts[1]}/`;
          }
        } else if (prefix) {
          fullValues.push(prefix + item);
        } else {
          fullValues.push(item);
        }
      });

      whereClause += `
    AND (
      ${fullValues.map(() => "InstRefNo = ?").join(" OR ")}
    )
  `;

      params = fullValues;
    }

    const [rows] = await connection.query(
      `SELECT * FROM instruments
      ${whereClause}
      ORDER BY SrNo DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `,
      params,
    );

    /* -------- COUNT QUERY -------- */
    const [[{ total }]] = await connection.execute(
      `
      SELECT COUNT(*) as total
      FROM instruments
      ${whereClause}
      `,
      params,
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
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
