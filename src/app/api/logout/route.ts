import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });

  // ✅ delete token cookie
  response.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: false,
    expires: new Date(0),
  });

  // ✅ delete userEmail cookie
  response.cookies.set("userEmail", "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: false,
    expires: new Date(0),
  });


  return response;
}


export async function GET(request: Request) {
  const url = new URL(request.url);

  // 🔁 support redirect chaining
  const redirect = url.searchParams.get("redirect") 
    || "http://115.241.45.146:8018/login";

  const response = NextResponse.redirect(redirect);

  // 🔥 delete cookies
  response.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  response.cookies.set("userEmail", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });

  return response;
}