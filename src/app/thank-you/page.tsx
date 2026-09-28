"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

export default function ThankYou() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-green-200/50 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.05)_1px,transparent_0)] bg-[size:24px_24px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/40 p-8 text-center">
          <div className="mb-6">
            <Image
              src="/Mitra_logo.png"
              alt="Mitra Industries"
              width={180}
              height={60}
              className="h-14 w-auto object-contain mx-auto"
              priority
            />
          </div>

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-900/20">
            <CheckCircle2 size={32} color="#fff" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Thank You
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Your details have been saved successfully.
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} Calibration Management. All rights reserved.
        </p>
      </div>
    </div>
  );
}
