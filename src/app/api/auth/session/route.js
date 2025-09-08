import { NextResponse } from 'next/server';

export async function POST(req) {
  const { token, remember } = await req.json();
  const res = NextResponse.json({ ok: true });

  res.cookies.set('staqk_auth', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 6 // 30d or 6h
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('staqk_auth', '', { path: '/', expires: new Date(0) });
  return res;
}