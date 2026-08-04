"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SessionWatcher() {
  const router = useRouter();

  useEffect(() => {
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
  }, []);

  return null;
}