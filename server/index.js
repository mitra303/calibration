import dotenv from "dotenv";
import path from "path";
import express from "express";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

// 👇 Import BOTH cron files
import "./cron/mailer_instruments_test.js";
// import "./cron/calibrationReminder.cron.js";
// import "./cron/calibrationReminder_instruments.cron.js";

const app = express();

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});