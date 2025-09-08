// middleware.js
import { NextResponse } from 'next/server';

const PROTECTED = [/^\/home/, /^\/account/, /^\/market/, /^\/me/];

export function middleware(req) {
  if (PROTECTED.some((r) => r.test(req.nextUrl.pathname))) {
    const has = req.cookies.get('staqk_auth')?.value;
    if (!has) {
      const url = new URL('/', req.url);
      url.searchParams.set('next', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|images|fonts).*)'],
};