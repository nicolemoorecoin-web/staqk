// returns the auth cookie (or null) so you can quickly verify middleware/login
import { NextResponse } from 'next/server';

export async function GET(req) {
  const cookie = req.cookies.get('staqk_auth')?.value || null;
  return NextResponse.json({ staqk_auth: cookie });
}
