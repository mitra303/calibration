"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from"); // ✅ read from URL
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (urlError === "unauthorized_department") {
      setError(
        "Only Quality Control, Quality Assurance and IT department can login"
      );
      setTimeout(() => setError(""), 4000);
    }
  }, [urlError]);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        setTimeout(() => setError(""), 3000);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Redirect Fix (UI unchanged)
      if (from && from.startsWith("/")) {
        window.location.href = decodeURIComponent(from);
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err) {
      setError("Something went wrong");
      setLoading(false);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-200/50 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.05)_1px,transparent_0)] bg-[size:24px_24px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/40 p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-4">
              <Image
                src="/Mitra_logo.png"
                alt="Mitra Industries"
                width={180}
                height={60}
                className="h-14 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Calibration System
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Sign in to manage your calibration records
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-sm mb-5 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-sm text-blue-600 hover:text-blue-700 transition"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 rounded-xl hover:from-blue-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} Calibration Management. All rights reserved.
        </p>
      </div>
    </div>
  );
}