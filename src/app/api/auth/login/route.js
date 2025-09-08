// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req) {
  const { email = '' } = await req.json();

  const token =
    'staqk_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  const maxAge = 60 * 60 * 24 * 30; // 30 days

  // ✅ Next 15 requires awaiting cookies()
  const jar = await cookies();

  // Either signature is fine; this one is simple
  jar.set('staqk_auth', encodeURIComponent(token), {
    path: '/',
    maxAge,
    sameSite: 'lax',
  });
  jar.set('staqk_email', encodeURIComponent(email), {
    path: '/',
    maxAge,
    sameSite: 'lax',
  });

  return NextResponse.json({ ok: true });
}
