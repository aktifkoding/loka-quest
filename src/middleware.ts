import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require auth
  const publicPaths = [
    "/",
    "/explore",
    "/regions",
    "/missions",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/callback",
  ];

  const isPublicPath = publicPaths.some(
    (path) =>
      pathname === path ||
      pathname.startsWith("/_next") ||
      pathname.endsWith(".ico") ||
      pathname.endsWith(".png") ||
      pathname.endsWith(".jpg") ||
      pathname.endsWith(".svg")
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // For API routes, let the route handlers handle auth
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Protected paths require authentication
  const protectedPaths = [
    "/player",
    "/educator",
    "/admin",
  ];

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // We can't do server-side auth check here efficiently without
    // duplicating logic, so we'll let the page components handle it
    // This middleware mainly serves as a basic routing layer
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
