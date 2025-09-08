import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  const supa = getServiceSupabase();
  const { error } = await supa.from('Balance').select('id').limit(1);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
