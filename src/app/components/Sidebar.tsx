"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  UploadCloud,
  Eye,
  Download,
  QrCode,
  Archive,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Upload", icon: UploadCloud },
  { href: "/view", label: "View", icon: Eye },
  { href: "/download", label: "Uploaded Download", icon: Download },
  { href: "/generate", label: "Generate QR", icon: QrCode },
  { href: "/all-qr-records", label: "All QR Records Download", icon: Archive },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 sticky top-0 h-screen overflow-y-auto bg-[#0f172a] text-slate-300 flex flex-col p-4">
      <div className="flex items-center gap-2 px-2 py-4 mb-4 border-b border-white/10">
        <Image
          src="/Mitra_logo.png"
          alt="Mitra Industries"
          width={120}
          height={40}
          className="h-8 w-auto object-contain brightness-0 invert"
        />
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {menuItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-900/30"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
