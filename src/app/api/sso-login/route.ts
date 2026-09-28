import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/app/lib/db";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    const decoded: any = jwt.verify(token, "mysupersecretkey");

    const [rows]: any = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [decoded.email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = rows[0];

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
      },
    });

    // ✅ Set session cookie (like CodeIgniter)
    res.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
    });

    res.cookies.set("userEmail", user.email, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
      maxAge: 60 * 60 * 24,
    });

    return res;

  } catch (err) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}