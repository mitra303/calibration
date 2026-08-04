import cron from "node-cron";
import { sendReminderMail } from "../mailer_instruments.js";
import { db } from "../../src/app/lib/db.js";
import { generateReminderPdf } from "./utils/generateReminderPdf.js";

// cron.schedule("0 12 * * *", async () => {
cron.schedule("* * * * *", async () => {
  console.log("🔔 Calibration reminder job running...");

  const [records] = await db.query(`
  SELECT *
  FROM instruments
  WHERE CalibDueOn IS NOT NULL
`);

  console.log("📦 Records found:", records.length);

  for (const row of records) {
    // const dateObj = new Date(row.CalibDueOn);
    // dateObj.setDate(dateObj.getDate() + 1);
    // const dueDate = dateObj.toISOString().split("T")[0];
    console.log("➡ Checking------:", row.InstrumentName, row.CalibDueOn);

    console.log("📧 Sending test mail now...");
    await sendReminderMail(row);
  }

  console.log("🛑 Stopping cron after first run");
  process.exit(0); // 👈 force stop
});