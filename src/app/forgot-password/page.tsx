"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMsg(data.message);
    } catch (err) {
      setMsg("Something went wrong");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 3000);
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
              Forgot Password
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Enter your email to receive a reset link
            </p>
          </div>

          {msg && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2.5 rounded-xl text-sm mb-5 text-center">
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 rounded-xl hover:from-blue-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {loading ? "Sending..." : "Send Reset Link"}
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
