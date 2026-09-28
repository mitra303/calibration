import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json({ message: "Not logged in" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const [rows]: any = await db.query(
      "SELECT password FROM users WHERE id = ?",
      [currentUser.id]
    );

    if (!rows.length) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hash,
      currentUser.id,
    ]);

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
