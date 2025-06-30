import type { Metadata } from "next";
import {Geist, Geist_Mono, Sarabun} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sarabun = Sarabun({
    weight: "400",
    subsets : ['thai']
});

export const metadata: Metadata = {
  title: "พร้อมเพย์",
  description: "เว็บสำหรับสร้าง qrcode",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sarabun.className}`}>
      {/*<body className={`${geistSans.variable} ${geistMono.variable}`}>*/}
      {/*<Navbar/>*/}
        {children}
      </body>
    </html>
  );
}
