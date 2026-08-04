"use client";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e:any) => {
    e.preventDefault();

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    setMsg(data.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-4">

      <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md space-y-5">

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Forgot Password
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your email to receive reset link
          </p>
        </div>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition">
          Send Reset Link
        </button>

        {msg && (
          <p className="text-center text-sm text-red-600">
            {msg}
          </p>
        )}

      </form>

    </div>
  );
}