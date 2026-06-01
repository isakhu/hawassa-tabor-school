// Root Layout
// This is the top-level layout wrapping the entire Next.js application.
// It will set up global providers (AuthProvider, ThemeProvider, QueryClientProvider),
// import global CSS/Tailwind styles, define metadata (title, description, favicon),
// and render the persistent shell (navbar, sidebar) around page content.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Management System",
  description: "A comprehensive platform for managing school operations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
