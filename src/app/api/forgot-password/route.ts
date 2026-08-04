export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { db } from "@/app/lib/db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // check user
    const [rows]: any = await db.query(
      "SELECT id FROM users WHERE email=?",
      [email]
    );
    console.log(rows); 

    if (!rows.length) {
      return NextResponse.json(
        { message: "Email not registered" },
        { status: 404 }
      );
    }

    // generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 30); // 30 min

    // store token
    await db.query(
      "UPDATE users SET reset_token=?, reset_expiry=? WHERE email=?",
      [token, expiry, email]
    );

    // reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;

    // transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // send mail
    await transporter.sendMail({
      from: `"Calibration System" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Reset your password",
      html: `
        <p>You requested password reset</p>
        <p>Click below link to reset password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 30 minutes.</p>
      `,
    });

    return NextResponse.json({
      message: "Reset link sent to your email",
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error. Try again." },
      { status: 500 }
    );
  }
}