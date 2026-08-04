export const runtime = "nodejs";
import { db } from "@/app/lib/db";

const BASE_QUERY = `
SELECT * FROM (
  SELECT
    CONCAT(
      COALESCE(ie.id, 'NOENTRY'),
      '_',
      COALESCE(i.id, 'NOINST')
    ) AS react_key,

    COALESCE(ie.qrCode, i.qrCode) AS qrCode,
    COALESCE(ie.InstRefNo, i.InstRefNo) AS InstRefNo,

    i.id             AS instrument_id,
    i.SrNo           AS instrument_srno,
    i.InstrumentName AS instrument_name,
    i.Make,
    i.Location,
    i.InstRange,
    i.LeastCount,
    i.RangeOfUse,
    i.CalibRange,
    i.Frequency,
    i.PerformedBy,
    i.CalibDueOn,
    i.FormNo,

    ie.id            AS entry_id,
    ie.qr_id,
    ie.EffectiveDate AS entry_effective_date,
    ie.ReviewDate    AS entry_review_date,
    ie.mail_status

  FROM instruments i
  LEFT JOIN instrument_entries ie
    ON i.InstRefNo = ie.InstRefNo

    WHERE i.isDeleted = 0

  UNION

  SELECT
    CONCAT(
      COALESCE(ie.id, 'NOENTRY'),
      '_',
      COALESCE(i.id, 'NOINST')
    ) AS react_key,

    COALESCE(ie.qrCode, i.qrCode) AS qrCode,
    COALESCE(ie.InstRefNo, i.InstRefNo) AS InstRefNo,

    i.id,
    i.SrNo,
    i.InstrumentName,
    i.Make,
    i.Location,
    i.InstRange,
    i.LeastCount,
    i.RangeOfUse,
    i.CalibRange,
    i.Frequency,
    i.PerformedBy,
    i.CalibDueOn,
    i.FormNo,

    ie.id,
    ie.qr_id,
    ie.EffectiveDate,
    ie.ReviewDate,
    ie.mail_status

  FROM instruments i
  RIGHT JOIN instrument_entries ie
    ON i.InstRefNo = ie.InstRefNo

    WHERE (i.isDeleted = 0 OR i.id IS NULL)
) combined
`;

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const fetchAll = searchParams.get("all") === "true";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.max(1, parseInt(searchParams.get("limit") || "8", 10) || 8);

  const conditions = [];
  const params = [];

  if (search) {
    // supports comma-separated multiple IDs (e.g. "MIPL/MG/76,87,77,78"),
    // matched as an OR across all of them
    const terms = search
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (terms.length) {
      const orConditions = terms.map(() => "(InstRefNo LIKE ? OR qr_id LIKE ?)").join(" OR ");
      conditions.push(`(${orConditions})`);
      terms.forEach((term) => params.push(`%${term}%`, `%${term}%`));
    }
  }
  if (startDate) {
    conditions.push("CalibDueOn >= ?");
    params.push(startDate);
  }
  if (endDate) {
    conditions.push("CalibDueOn <= ?");
    params.push(endDate);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [countRows] = await db.query(
    `SELECT COUNT(*) AS total FROM (${BASE_QUERY}) t ${whereClause}`,
    params
  );
  const total = countRows[0]?.total || 0;

  let dataQuery = `${BASE_QUERY} ${whereClause} ORDER BY InstRefNo`;
  const dataParams = [...params];

  if (!fetchAll) {
    const offset = (page - 1) * limit;
    dataQuery += ` LIMIT ? OFFSET ?`;
    dataParams.push(limit, offset);
  }

  const [rows] = await db.query(dataQuery, dataParams);

  return Response.json({ data: rows, total });
}