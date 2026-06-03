// Home / Landing Page
// This is the public-facing entry point of the application.
// It will display a marketing/welcome page with a brief overview of the system,
// a call-to-action button to navigate to login or register,
// and links to key features. Unauthenticated users land here first.

import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect root to the login page to avoid a blank landing page
  redirect("/login");
}
