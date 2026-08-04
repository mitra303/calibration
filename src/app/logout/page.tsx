"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await fetch("/api/logout", {
        method: "POST",
      });

      router.replace("/login");
    };

    logout();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-lg">Logging out...</p>
    </div>
  );
}