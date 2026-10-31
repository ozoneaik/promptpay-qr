import type {Metadata, Viewport} from "next";
import {Sarabun} from "next/font/google";
import "./globals.css";
import React from "react";

const sarabun = Sarabun({
    variable: "--font-sarabun",
    weight: ["400", "700"],
    subsets: ['thai', 'latin'],
});

export const metadata: Metadata = {
    title: "พร้อมเพย์ QR",
    description: "สร้าง QR Code รับเงินผ่านพร้อมเพย์ ด้วยเบอร์โทร เลขบัตรประชาชน หรือ e-Wallet ID",
    // iOS: เปิดจากหน้า Home แบบเต็มจอ ให้ status bar โปร่งใสทับแถบดำด้านบนของแอป
    appleWebApp: {
        capable: true,
        title: "พร้อมเพย์ QR",
        statusBarStyle: "black-translucent",
    },
    // Next ใส่ให้แค่ mobile-web-app-capable ส่วน iOS ก่อน 16.4 ยังต้องใช้ชื่อเดิม
    other: {
        "apple-mobile-web-app-capable": "yes",
    },
};

export const viewport: Viewport = {
    themeColor: "#6d84a2",
    // ให้หน้าเว็บขยายเต็มจอถึงใต้รอยบาก แล้วเว้นขอบเองด้วย env(safe-area-inset-*)
    viewportFit: "cover",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="th">
        <body className={sarabun.variable}>
        {children}
        </body>
        </html>
    );
}
