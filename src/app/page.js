'use client';

import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const nextTarget =
    typeof window === 'undefined'
      ? '/home'
      : new URLSearchParams(window.location.search).get('next') || '/home';

  useEffect(() => {
    const hasCookie =
      typeof document !== 'undefined' &&
      /(?:^|;\s*)staqk_auth=/.test(document.cookie);
    if (hasCookie) window.location.replace(nextTarget);
  }, [nextTarget]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!agree) return setErr('Please accept Terms to continue.');
    try {
      setLoading(true);
      const token = 'staqk_' + Math.random().toString(36).slice(2) + Date.now().toString(36);

      // client-only convenience (optional)
      localStorage.setItem('staqk_auth', token);
      localStorage.setItem('staqk_user', JSON.stringify({ email, name: email.split('@')[0] || 'User' }));

      // set cookies (token + email) server-side
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      });
      if (!r.ok) throw new Error('login failed');

      // (optional) warm up /api/me once; or just go to /home and let pages fetch there
      await fetch('/api/me', { cache: 'no-store' });

      window.location.href = nextTarget;
    } catch (e) {
      console.error(e);
      setErr('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-4">
        <h1 className="text-xl font-semibold">Welcome to STAQK</h1>

        <label className="block text-sm text-gray-300">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg bg-black border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          I agree to Terms &amp; Privacy
        </label>

        {err && <p className="text-red-400 text-sm">{err}</p>}

        <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 font-medium">
          {loading ? 'Please wait…' : 'Continue'}
        </button>
      </form>
    </main>
  );
}
