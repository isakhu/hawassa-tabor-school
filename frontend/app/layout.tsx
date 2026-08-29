import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { ServiceWorkerCleanup } from "@/components/ServiceWorkerCleanup";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tabor School — School Management System",
    template: "%s | Tabor School",
  },
  description:
    "Tabor School management system for students, teachers, classes, attendance, grades, and academic administration.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Tabor School — School Management System",
    description: "School administration for students, teachers, classes, attendance, and grades.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const buildId = process.env.NEXT_PUBLIC_BUILD_ID ?? "local";

  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen antialiased" style={{ backgroundColor: "#f6f9fd" }}>
        <ServiceWorkerCleanup />
        {children}
        <div aria-label={`Build ${buildId}`} style={{ position: "fixed", right: "8px", bottom: "6px", zIndex: 50, color: "rgba(78,101,125,0.35)", fontSize: "10px", lineHeight: 1, fontFamily: "monospace", pointerEvents: "none" }}>
          build {buildId}
        </div>
      </body>
    </html>
  );
}
