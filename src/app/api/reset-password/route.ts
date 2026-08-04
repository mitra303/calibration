import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import bcrypt from "bcrypt";

export async function POST(req:Request){
  const { token,password } = await req.json();


  const [rows]:any = await db.query(
    "SELECT * FROM users WHERE reset_token=? AND reset_expiry>NOW()",
    [token]
  );

  if(!rows.length)
    return NextResponse.json({ message:"Invalid or expired token" });

  const hash = await bcrypt.hash(password,10);

  await db.query(
    "UPDATE users SET password=?, reset_token=NULL, reset_expiry=NULL WHERE reset_token=?",
    [hash,token]
  );

  return NextResponse.json({ message:"Password reset successful" });
}