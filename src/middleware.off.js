// middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Treat these as public pages
const PUBLIC_PATHS = ["/login", "/signup"];
const PUBLIC_FILE = /\.(.*)$/; // files like /favicon.ico, /robots.txt, etc.

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Allow public assets, Next.js internals, NextAuth endpoints, and our public pages
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_FILE.test(pathname) ||
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return NextResponse.next();
  }

  // Gate everything else
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Run on all routes except Next.js internals and static assets
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/wallet/:path*",  
    "/me",
    "/account/:path*",
    "/wallet/:path*",
    "/home",
    "/market/:path*",
    "/transactions",
    "/investments",
    "/dashboard",
    "/strategies",
    "/legal",
    "/reports",
    "/support",
    "/support/:path*",
  ],
};


