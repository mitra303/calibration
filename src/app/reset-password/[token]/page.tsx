"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function ResetPassword(){
  const { token } = useParams();

  const [password,setPassword]=useState("");
  const [confirmPassword,setConfirmPassword]=useState("");
  const [msg,setMsg]=useState("");
  const [error,setError]=useState("");

  const router = useRouter();
  const handleReset = async (e:any)=>{
    e.preventDefault();

    setError("");
    setMsg("");

    // ✅ match validation
    if(password !== confirmPassword){
      setError("Passwords do not match");
      return;
    }

    const res = await fetch("/api/reset-password",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ token,password })
    });

    const data = await res.json();
    setMsg(data.message);

    // ✅ redirect after success
  if (res.ok) {
    setTimeout(() => {
      router.push("/login"); // change path if needed
    }, 1500); // small delay to show message
  }
  };

  return(
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-4">

      <form onSubmit={handleReset} className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md space-y-5">

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Reset Password
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your new password below
          </p>
        </div>

        {/* New Password */}
        <input
          type="password"
          placeholder="New Password"
          className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e)=>setPassword(e.target.value)}
          required
        />

        {/* Confirm Password */}
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e)=>setConfirmPassword(e.target.value)}
          required
        />

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        {/* Success */}
        {msg && (
          <p className="text-green-600 text-sm text-center">
            {msg}
          </p>
        )}

        <button className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition">
          Reset Password
        </button>

      </form>

    </div>
  );
}