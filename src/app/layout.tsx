import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// ✅ ADD THIS
import SessionWatcher from "@/app/components/SessionWatcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calibration System",
  description: "Calibration Management System",
  icons: {
    icon: "/logo1.ico",
    shortcut: "/logo1.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        {/* 🔥 ADD THIS LINE */}
        <SessionWatcher />
        {children}
      </body>
    </html>
  );
}
