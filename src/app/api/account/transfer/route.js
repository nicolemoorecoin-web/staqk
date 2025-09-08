import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const { userId, amount, from = 'cash', to = 'crypto', note = null } = await req.json();
    if (!userId || !amount) return NextResponse.json({ error: 'Missing userId or amount' }, { status: 400 });

    const supa = getServiceSupabase();

    // record a transfer
    const { error: txErr } = await supa.from('Transaction').insert({
      userId,
      type: 'TRANSFER',
      asset: `${from}->${to}`,
      amount,
      currency: 'USD',
      note,
      status: 'COMPLETED',
    });
    if (txErr) throw txErr;

    // move buckets, keep total
    const { data: existing, error: balErr } = await supa
      .from('Balance').select('*').eq('userId', userId).maybeSingle();
    if (balErr) throw balErr;

    const buckets = existing?.buckets ?? {};
    const newBuckets = {
      ...buckets,
      [from]: Number(buckets[from] || 0) - Number(amount),
      [to]:   Number(buckets[to]   || 0) + Number(amount),
    };

    const { error: upErr } = await supa.from('Balance').upsert({
      id: existing?.id, userId,
      total: Number(existing?.total || 0),
      buckets: newBuckets,
      updatedAt: new Date().toISOString(),
    });
    if (upErr) throw upErr;

    return NextResponse.json({ ok: true, total: Number(existing?.total || 0), buckets: newBuckets });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
