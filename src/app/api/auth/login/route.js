import { NextResponse } from 'next/server';

export async function POST(req) {
  const { email, name } = await req.json();
  if (!email) return NextResponse.json({ ok:false, error:'email required' }, { status: 400 });

  const token = 'staqk_' + Math.random().toString(36).slice(2) + Date.now().toString(36);

  const res = NextResponse.json({ ok: true, token, profile: { email, name: name || email.split('@')[0] } });
  res.cookies.set('staqk_auth', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // localhost works in dev
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
