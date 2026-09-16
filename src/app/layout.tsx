import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Locket Gold | Premium Digital Store",
  description:
    "Hệ thống bán & kích hoạt Locket Gold bảo mật cao cấp. Đăng ký CTV, quản lý đơn hàng, thanh toán tự động.",
  keywords: ["Locket Gold", "CTV", "digital store", "Zalo bot"],
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-mesh text-slate-100">
        {children}
      </body>
    </html>
  );
}
