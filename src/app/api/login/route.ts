import { NextResponse } from "next/server";
import bcrypt from "bcrypt"; // better use bcryptjs
import { db } from "@/app/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and Password required" },
        { status: 400 }
      );
    }

    const [rows]: any = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Create response first
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
      },
    });

    // ✅ Set secure cookie
    // response.cookies.set("auth", "true", {
    response.cookies.set("token", "loggedin", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
      maxAge: 60 * 60 * 24, // 1 day
    });

    
    response.cookies.set("userEmail", user.email, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}