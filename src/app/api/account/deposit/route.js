// src/app/api/account/deposit/route.js
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const { userId, amount, bucket = 'cash', asset = 'USD', note = null } = await req.json();
    if (!userId || !amount) return NextResponse.json({ error: 'Missing userId or amount' }, { status: 400 });

    const supa = getServiceSupabase();

    // 1) Insert transaction
    const { error: txErr } = await supa.from('Transaction').insert({
      userId,
      type: 'DEPOSIT',
      asset,
      amount,
      currency: 'USD',
      note,
      status: 'COMPLETED',
    });
    if (txErr) throw txErr;

    // 2) Upsert balance (add to total and the bucket)
    const { data: existing, error: balErr } = await supa
      .from('Balance')
      .select('*')
      .eq('userId', userId)
      .maybeSingle();
    if (balErr) throw balErr;

    const buckets = existing?.buckets ?? {};
    const newBuckets = { ...buckets, [bucket]: Number(buckets[bucket] || 0) + Number(amount) };
    const newTotal = Number(existing?.total || 0) + Number(amount);

    const { error: upErr } = await supa.from('Balance').upsert({
      id: existing?.id, userId,
      total: newTotal,
      buckets: newBuckets,
      updatedAt: new Date().toISOString(),
    });
    if (upErr) throw upErr;

    return NextResponse.json({ ok: true, total: newTotal, buckets: newBuckets });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
