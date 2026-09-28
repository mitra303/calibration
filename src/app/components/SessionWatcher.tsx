"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password", "/sso-login"];

export default function SessionWatcher() {
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  useEffect(() => {
    if (isPublicRoute) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/check-session", {
          credentials: "include",
        });

        const data = await res.json();

        if (!data.loggedIn) {
          //alert("Session expired");
          router.push("/login");
        }
      } catch (err) {
        console.error("Session check failed", err);
      }
    }, 5000); // ⏱ every 5 sec

    return () => clearInterval(interval);
  }, [isPublicRoute]);

  return null;
}