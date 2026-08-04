import nodemailer from "nodemailer";

/* ===== DATE HELPERS (UTC SAFE) ===== */
const toUTCDate = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

const addDays = (dateStr, days) => {
  const d = toUTCDate(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

const diffInDays = (fromDate, toDate) =>
  Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24));

/* ===== MAIL FUNCTION ===== */
export const sendReminderMail = async (data) => {
  const today = new Date();
  //const today = toUTCDate("2028-02-02");
  today.setUTCHours(0, 0, 0, 0);

  let dueDate;
  // ✅ Priority: ReviewDate first
  if (data.ReviewDate && data.ReviewDate !== "") {
    dueDate = toUTCDate(data.ReviewDate);
  } else {
    dueDate = addDays(data.EffectiveDate, 365);
  }

  const daysLeft = diffInDays(today, dueDate);

  console.log({
    Instrument: data.InstrumentName,
    EffectiveDate: data.EffectiveDate,
    ReviewDate: data.ReviewDate,
    DueDate: dueDate.toISOString().split("T")[0],
    daysLeft,
  });

  if (daysLeft > 15) {
    console.log("❌ Skip: Not in reminder window");
    return;
  }

  /* ===== MAIL CONFIG ===== */

  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Calibration System" <${process.env.MAIL_USER}>`,
    to: "nitish@mitraindustries.com",
    // to: "nitish@mitraindustries.com, naman.garg@mitraindustries.com, user3@example.com",
    subject: "⏰ Calibration Due Reminder",
    html: `
<div style="max-width:620px;margin:auto;background:#f3f4f6;padding:20px">

  <div style="
    background:#ffffff;
    border-radius:12px;
    box-shadow:0 6px 18px rgba(0,0,0,0.08);
    overflow:hidden;
    font-family:Arial,Helvetica,sans-serif;
  ">

    <!-- Header -->
    <div style="
      background:#2563eb;
      color:#ffffff;
      padding:16px 20px;
    ">
      <h2 style="margin:0;font-size:18px;">🔔 Calibration Reminder</h2>
      <p style="margin:4px 0 0;font-size:13px;opacity:0.9;">
        Action required before due date
      </p>
    </div>

    <!-- Body -->
    <div style="padding:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <!-- Left Info -->
          <td style="vertical-align:top;padding-right:10px;">
            <table width="100%" style="font-size:14px;color:#111827;">
              <tr><td><b>Instrument</b></td><td>: ${data.InstrumentName}</td></tr>
              <tr><td><b>Ref No</b></td><td>: ${data.InstRefNo}</td></tr>
              <tr><td><b>Make</b></td><td>: ${data.Make}</td></tr>
              <tr><td><b>Location</b></td><td>: ${data.Location}</td></tr>
              <tr><td><b>Range</b></td><td>: ${data.InstRange}</td></tr>
              <tr><td><b>Least Count</b></td><td>: ${data.LeastCount}</td></tr>
              <tr><td><b>Use Range</b></td><td>: ${data.RangeOfUse}</td></tr>
              <tr><td><b>Calibration</b></td><td>: ${data.CalibRange}</td></tr>
              <tr><td><b>Frequency</b></td><td>: ${data.Frequency}</td></tr>
              <tr><td><b>Performed By</b></td><td>: ${data.PerformedBy}</td></tr>
              <tr><td><b>Cal Done</b></td><td>: ${data.EffectiveDate}</td></tr>
              <tr><td><b>Cal Due</b></td><td>: ${data.ReviewDate}</td></tr>
            </table>
          </td>

          <!-- Right QR -->
          <td align="right" style="vertical-align:top;">
            <div style="
              border:1px solid #e5e7eb;
              border-radius:10px;
              padding:10px;
              text-align:center;
            ">
              <img src="${data.qrCode}" width="120" style="display:block;margin:auto;" />
              <p style="font-size:12px;color:#6b7280;margin-top:6px;">
                Scan for details
              </p>
            </div>
          </td>
        </tr>
      </table>

      <!-- Due Date -->
      <div style="
        margin-top:20px;
        padding:14px;
        background:#fee2e2;
        border-left:5px solid #dc2626;
        border-radius:8px;
        font-size:14px;
      ">
        <b>⏰ Due On:</b>
         <span style="color:#b91c1c;font-weight:bold;">
            ${dueDate.toISOString().split("T")[0]}
        </span>
      </div>

      <!-- Footer -->
      <div style="margin-top:20px;font-size:13px;color:#374151;">
        Please ensure calibration is completed before the due date to remain compliant.
      </div>
    </div>

    <!-- Footer Strip -->
    <div style="
      background:#f9fafb;
      padding:12px;
      text-align:center;
      font-size:12px;
      color:#6b7280;
    ">
      — Calibration Management System
    </div>

  </div>
</div>
`,
  });

  console.log("✅ Mail sent successfully");
}; 