import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  cookies().set({ name: 'staqk_auth', value: '', maxAge: 0, path: '/', sameSite: 'lax' });
  return NextResponse.json({ ok: true });
}
