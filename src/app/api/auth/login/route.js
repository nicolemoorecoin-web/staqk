import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  const { token, email } = await request.json().catch(() => ({}));
  if (!token || !email) {
    return NextResponse.json({ ok: false, error: 'missing token or email' }, { status: 400 });
  }

  const maxAge = 60 * 60 * 24 * 30;
  const jar = cookies();

  jar.set({ name: 'staqk_auth',  value: encodeURIComponent(token), path: '/', maxAge, sameSite: 'lax' });
  jar.set({ name: 'staqk_email', value: encodeURIComponent(email), path: '/', maxAge, sameSite: 'lax' });

  return NextResponse.json({ ok: true });
}
