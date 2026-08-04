import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const protectedRoutes = [
    "/dashboard",
    "/view",
    "/generate",
    "/download",
    "/generated-view",
    "/generate-download",
    "/entry",
    "/details",
    "/all-qr-records",
  ];

const isProtected = protectedRoutes.some(
  (route) =>
    request.nextUrl.pathname === route ||
    request.nextUrl.pathname.startsWith(route + "/")
);

  if (!token && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "from",
      request.nextUrl.pathname + request.nextUrl.search
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/view/:path*",
    "/generate/:path*",
    "/download/:path*",
    "/generated-view/:path*",
    "/generate-download/:path*",
    "/all-qr-records/:path*",
    "/entry/:path*",
    "/details/:path*",
  ],
};