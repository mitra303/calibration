import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set("token", "test123", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  return res;
}