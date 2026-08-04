"use client";

import { useState } from "react";
import { User, Lock, LogIn } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from"); // ✅ read from URL

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Calibration System
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Please login to continue
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          
          {/* Forgot password */}
          <div className="text-right -mt-2">
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200"
          >
            <LogIn size={18} />
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Calibration Management
        </p>
      </div>
    </div>
  );
}