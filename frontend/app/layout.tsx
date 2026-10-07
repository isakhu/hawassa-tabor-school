import type { Metadata } from "next";
import { Syne, DM_Sans, Caveat } from "next/font/google";
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

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${caveat.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen antialiased bg-[#f6f9fd] relative overflow-x-hidden selection:bg-blue-200 selection:text-blue-900">
        
        {/* Vibrant Gradient Meshes */}
        <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-100/40 via-purple-100/30 to-blue-50/20 blur-3xl pointer-events-none -z-10"></div>
        <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-blue-100/40 via-sky-50/30 to-transparent blur-3xl pointer-events-none -z-10"></div>

        <ServiceWorkerCleanup />
        {children}
      </body>
    </html>
  );
}
