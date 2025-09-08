// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';
import { createBrowserClient, createServerClient } from '@supabase/ssr';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Browser client (uses anon key)
let _browser;
export function getBrowserSupabase() {
  if (!_browser) _browser = createBrowserClient(url, anon);
  return _browser;
}

// Server client (uses anon key; can read cookies if you wire Supabase Auth later)
export function getServerSupabase(cookies) {
  return createServerClient(url, anon, { cookies });
}

// Service client (server-only, bypasses RLS for your own API routes)
export function getServiceSupabase() {
  return createClient(url, service, { auth: { persistSession: false } });
}