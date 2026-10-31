import type {MetadataRoute} from "next";

// display: standalone = เปิดจากหน้า Home แล้วไม่มีแถบเบราว์เซอร์ เหมือนแอปจริง
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "พร้อมเพย์ QR",
        short_name: "พร้อมเพย์ QR",
        description: "สร้าง QR Code รับเงินผ่านพร้อมเพย์",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#c5ccd4",
        theme_color: "#6d84a2",
        icons: [
            {src: "/icons/icon-192.png", sizes: "192x192", type: "image/png"},
            {src: "/icons/icon-512.png", sizes: "512x512", type: "image/png"},
            {src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable"},
        ],
    };
}
