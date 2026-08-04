import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { db } from "@/app/lib/db";

const CENTRAL_AUTH_URL =
  "http://115.241.45.146:8016/accounts/auth-subapp/?app_name=Calibration";

function resolveOrigin(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "");
  return host ? `${protocol}://${host}` : req.nextUrl.origin;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const origin = resolveOrigin(req);

  if (!token) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  try {
    const authRes = await fetch(CENTRAL_AUTH_URL, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!authRes.ok) {
      return NextResponse.redirect(new URL("/login", origin));
    }

    const authData: any = await authRes.json();
    const centralUser = authData.user;
    const email = centralUser?.email;
    const fullName = centralUser?.full_name;

    if (!email) {
      return NextResponse.redirect(new URL("/login", origin));
    }

    const [rows]: any = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hash = await bcrypt.hash(randomPassword, 10);

      await db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [fullName || email, email, hash]
      );
    }

    const response = NextResponse.redirect(new URL("/dashboard", origin));

    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
      maxAge: 60 * 60 * 24,
    });

    response.cookies.set("userEmail", email, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    console.error("SSO login error:", err);
    return NextResponse.redirect(new URL("/login", origin));
  }
}
