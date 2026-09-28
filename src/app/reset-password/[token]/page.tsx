"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Eye, EyeOff, ArrowLeft, KeyRound } from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e: any) => {
    e.preventDefault();

    setError("");
    setMsg("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      setMsg(data.message);

      if (res.ok) {
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setTimeout(() => setMsg(""), 3000);
      }
    } catch (err) {
      setError("Something went wrong");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
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
              Reset Password
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Enter your new password below
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-sm mb-5 text-center">
              {error}
            </div>
          )}

          {msg && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2.5 rounded-xl text-sm mb-5 text-center">
              {msg}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div className="relative">
              <Lock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
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

            <div className="relative">
              <Lock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                <KeyRound size={18} />
              )}
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition pt-1"
            >
              <ArrowLeft size={15} />
              Back to login
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
