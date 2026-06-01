// Next.js Middleware
// This middleware runs on every request before it reaches a page or API route.
// Responsibilities:
//   - Protect authenticated routes: redirect unauthenticated users to /login
//   - Role-based access control: prevent students from accessing /dashboard/admin, etc.
//   - Read the JWT from cookies and validate it on the edge
//   - Allow public routes (/login, /register, /) to pass through without auth checks
// Docs: https://nextjs.org/docs/app/building-your-application/routing/middleware

export {};
