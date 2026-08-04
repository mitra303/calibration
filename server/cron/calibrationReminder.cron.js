import cron from "node-cron";
import { sendReminderMail } from "../mailer.js";
import { db } from "../../src/app/lib/db.js";
import { generateReminderPdf } from "./utils/generateReminderPdf.js";

// cron.schedule("0 12 * * *", async () => {
cron.schedule("* * * * *", async () => {
  console.log("🔔 Entries reminder job running...");

  const [records] = await db.query(`
    SELECT *
    FROM instrument_entries
    WHERE EffectiveDate IS NOT NULL
  `);

  console.log("📦 Records found:", records.length);

  for (const row of records) {
    console.log("➡ Checking:", row.InstrumentName, row.EffectiveDate);
    await sendReminderMail(row);
  }

  console.log("✅ Entries cron completed");
});