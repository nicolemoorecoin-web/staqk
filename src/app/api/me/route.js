// demo user + balances gated by the cookie
import { NextResponse } from 'next/server';

export async function GET(req) {
  const token = req.cookies.get('staqk_auth')?.value;

  if (!token) {
    return NextResponse.json({ ok: false, error: 'No auth cookie' }, { status: 401 });
  }

  // Demo payload – replace with Supabase later
  const user = { name: 'Henry', email: 'henry@example.com' };
  const balances = {
    total: 12500,
    income: 2450,
    expense: 920,
    buckets: { crypto: 8350, cash: 3000, staking: 800, earnWallet: 350 },
  };

  return NextResponse.json({ ok: true, user, balances });
}
