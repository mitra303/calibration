import cron from "node-cron";
import nodemailer from "nodemailer";
import { db } from "../../src/app/lib/db.js";
import { generateReminderPdf } from "../utils/generateReminderPdf.js";

/* ===== DATE HELPERS ===== */
const toUTCDate = (dateInput) => {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const addDays = (dateStr, days) => {
  const d = toUTCDate(dateStr);
  if (!d) return null;   // safety
  d.setDate(d.getDate() + days);
  return d;
};

const diffInDays = (fromDate, toDate) =>
  Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24));

/* ===== CRON JOB ===== */
//cron.schedule("0 12 * * *", async () => {
cron.schedule("39 12 * * *", async () => {
//cron.schedule("* * * * *", async () => {
  console.log("🔔 Calibration reminder job running...");

  const [records] = await db.query(`
SELECT
  COALESCE(i.InstrumentName, ie.InstrumentName) AS InstrumentName,
  COALESCE(i.InstRefNo, ie.InstRefNo) AS InstRefNo,
  COALESCE(i.Make, ie.Make) AS Make,
  COALESCE(i.Location, ie.Location) AS Location,
  COALESCE(i.InstRange, ie.InstRange) AS InstRange,
  COALESCE(i.LeastCount, ie.LeastCount) AS LeastCount,
  COALESCE(i.RangeOfUse, ie.RangeOfUse) AS RangeOfUse,
  COALESCE(i.CalibRange, ie.CalibRange) AS CalibRange,
  COALESCE(i.Frequency, ie.Frequency) AS Frequency,
  COALESCE(i.PerformedBy, ie.PerformedBy) AS PerformedBy,
  COALESCE(i.EffectiveDate, STR_TO_DATE(ie.EffectiveDate, '%Y-%m-%d')) AS EffectiveDate,
  COALESCE(i.CalibDueOn, STR_TO_DATE(ie.CalibDueOn, '%Y-%m-%d')) AS CalibDueOn,
  COALESCE(i.ReviewDate, STR_TO_DATE(ie.ReviewDate, '%Y-%m-%d')) AS ReviewDate,
  COALESCE(i.qrCode, ie.qrCode) AS qrCode,
  COALESCE(i.department, ie.department) AS department

FROM instruments i
LEFT JOIN instrument_entries ie
  ON i.InstRefNo = ie.InstRefNo
  WHERE i.isDeleted = 0

UNION

SELECT
  COALESCE(i.InstrumentName, ie.InstrumentName),
  COALESCE(i.InstRefNo, ie.InstRefNo),
  COALESCE(i.Make, ie.Make),
  COALESCE(i.Location, ie.Location),
  COALESCE(i.InstRange, ie.InstRange),
  COALESCE(i.LeastCount, ie.LeastCount),
  COALESCE(i.RangeOfUse, ie.RangeOfUse),
  COALESCE(i.CalibRange, ie.CalibRange),
  COALESCE(i.Frequency, ie.Frequency),
  COALESCE(i.PerformedBy, ie.PerformedBy),
  COALESCE(i.EffectiveDate, STR_TO_DATE(ie.EffectiveDate, '%Y-%m-%d')),
  COALESCE(i.CalibDueOn, STR_TO_DATE(ie.CalibDueOn, '%Y-%m-%d')),
  COALESCE(i.ReviewDate, STR_TO_DATE(ie.ReviewDate, '%Y-%m-%d')),
  COALESCE(i.qrCode, ie.qrCode),
  COALESCE(i.department, ie.department)

FROM instrument_entries ie
LEFT JOIN instruments i
  ON i.InstRefNo = ie.InstRefNo
WHERE ie.EffectiveDate IS NOT NULL
  AND ie.InstRefNo IS NOT NULL
  AND (i.isDeleted = 0 OR i.isDeleted IS NULL);
  `);

  console.log("📦 Records found:", records.length);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let dueRecords = [];

  //Date
  const today2 = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
// Example: 13-02-2026
  for (const row of records) {

    // ✅ SAFETY CHECK (YAHAN ADD KARO)
    if (!row.CalibDueOn && !row.EffectiveDate) {
      console.log("⛔ Skipping invalid record:", row.InstRefNo);
      continue;
    }

    let dueDate;

    if (row.CalibDueOn && row.CalibDueOn !== "") {
      dueDate = toUTCDate(row.CalibDueOn);
    } else {
      dueDate = addDays(row.EffectiveDate, 365);
    }

    // Extra safety (double protection)
    if (!dueDate) {
      console.log("⛔ Invalid due date:", row.InstRefNo);
      continue;
    }

    const daysLeft = diffInDays(today, dueDate);

    //console.log("➡ Checking:", row.InstrumentName, "Days Left:", daysLeft);

    if (daysLeft <= 7) {
      dueRecords.push({
        ...row,
        DueDate: dueDate,
      });
    }
  }

  console.log("📌 Due Records:", dueRecords.length);

  if (dueRecords.length === 0) {
    console.log("❌ No reminders needed");
    process.exit(0);
  }

  /* ===== SPLIT BY DEPARTMENT ===== */
  const qaRecords = dueRecords.filter((r) => r.department !== "Quality Control");
  const qcRecords = dueRecords.filter((r) => r.department === "Quality Control");

  const RECIPIENTS = {
    qa: "qad1@mitraindustries.com, qa_khushi@mitraindustries.com, gopal.sharma@mitraindustries.com, nitish@mitraindustries.com",
    qc: "vivek.kumar@mitraindustries.com, Madhu.Jha@mitraindustries.com, divya@mitraindustries.com, roshan.chaudhary@mitraindustries.com, nitish@mitraindustries.com",
  };

  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const sendDepartmentMail = async (label, records, to) => {
    if (records.length === 0) {
      console.log(`⏭ Skipping ${label} mail — no due records`);
      return;
    }

    const pdfPath = await generateReminderPdf(records);

    await transporter.sendMail({
      from: `"Calibration System" <${process.env.MAIL_USER}>`,
      to,
      subject: `⏰ Calibration Due Report - ${label} (${records.length} Instruments)`,

      text: `Dear Team,

Please find attached the Calibration Due Summary Report for your review.

The report highlights instruments that are approaching their calibration due dates as well as those that have already exceeded the due date. Timely review and necessary action are requested to ensure compliance, accuracy, and uninterrupted operations.

Kindly let us know if any clarification or additional details are required.`,

      attachments: [
        {
          filename: `Calibration-Due-Report-${label}-${today2}.pdf`,
          path: pdfPath,
        },
      ],
    });

    console.log(`✅ ${label} summary mail sent successfully`);
  };

  await sendDepartmentMail("Quality Assurance", qaRecords, RECIPIENTS.qa);
  await sendDepartmentMail("Quality Control", qcRecords, RECIPIENTS.qc);

  process.exit(0);
});