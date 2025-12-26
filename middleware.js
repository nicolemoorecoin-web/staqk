// middleware.js (project root)
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req) {
  const { pathname, search } = req.nextUrl;

  // ✅ Allow Next internals, assets, ALL api routes, and auth pages
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") || // ✅ important
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    PUBLIC_FILE.test(pathname) ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/" // remove this line if you want "/" protected too
  ) {
    return NextResponse.next();
  }

  // ✅ Protect matched routes using NextAuth token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/account/:path*",
    "/market/:path*",
    "/me/:path*",
    "/transactions/:path*",
    "/investments/:path*",
    "/dashboard/:path*",
    "/support/:path*",
    "/admin/:path*",
  ],
};
