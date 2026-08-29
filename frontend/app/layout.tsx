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
    default: "Hawassa Tabor Primary and Secondary School — Management System",
    template: "%s | Hawassa Tabor School",
  },
  description:
    "School management system for Hawassa Tabor Primary and Secondary School.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Hawassa Tabor Primary and Secondary School",
    description: "School management system for Hawassa Tabor Primary and Secondary School.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen antialiased" style={{ backgroundColor: "#f6f9fd" }}>
        <ServiceWorkerCleanup />
        {children}
      </body>
    </html>
  );
}
