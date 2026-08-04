"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SSOLoginClient() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = params.get("token");

    console.log("SSO TOKEN:", token); // 🔍 DEBUG

    if (!token) {
      console.log("No token found ❌");
      router.push("/login");
      return;
    }

    fetch("/api/sso-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();

        console.log("SSO RESPONSE:", data); // 🔍 DEBUG

        if (!res.ok) {
          throw new Error(data.message || "SSO failed");
        }

        console.log("SSO SUCCESS ✅");

        router.push("/dashboard");
      })
      .catch((err) => {
        console.error("SSO ERROR ❌:", err); // 🔍 DEBUG

        alert("SSO Failed: " + err.message); // 👈 SHOW ERROR

        router.push("/login");
      });

  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      Logging you in...
    </div>
  );
}