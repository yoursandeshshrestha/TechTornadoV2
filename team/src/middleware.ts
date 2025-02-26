// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const { pathname } = request.nextUrl;

  // Auth pages - redirect to dashboard if already logged in
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Protected pages - require authentication
  const isProtectedPage =
    pathname === "/dashboard" ||
    pathname.startsWith("/challenges") ||
    pathname.startsWith("/profile");

  if (isAuthPage && token) {
    // If on login/register page and already logged in, redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtectedPage && !token) {
    // If on protected page and not logged in, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Auth pages
    "/login",
    "/register",
    // Protected pages
    "/dashboard",
    "/challenges/:path*",
    "/profile/:path*",
  ],
};
