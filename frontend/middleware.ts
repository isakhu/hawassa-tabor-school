import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/register"];

const ROLE_DASHBOARDS: Record<string, string> = {
  ADMIN:   "/dashboard/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value ?? null;
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  // ── Unauthenticated user hitting a protected route ────────────────────────
  if (!token && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Authenticated user hitting /login or /register ────────────────────────
  if (token && isPublic) {
    // Decode role from JWT payload (no verification — edge runtime only)
    try {
      const payloadBase64 = token.split(".")[1];
      const payload = JSON.parse(
        Buffer.from(payloadBase64, "base64url").toString("utf-8")
      );
      const role: string = (payload.role ?? "").toUpperCase();
      const dashboard = ROLE_DASHBOARDS[role] ?? "/dashboard/admin";
      return NextResponse.redirect(new URL(dashboard, request.url));
    } catch {
      // Malformed token — clear it and let the user log in
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
