import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|images|api).*)'],
};

export function middleware(req) {
  const token = req.cookies.get('staqk_auth')?.value;
  const isValid = token?.startsWith?.('staqk_') === true; // <- only our tokens

  const { pathname } = req.nextUrl;

  if (pathname === '/') {
    if (isValid) {
      const url = req.nextUrl.clone();
      url.pathname = '/home';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!isValid) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}