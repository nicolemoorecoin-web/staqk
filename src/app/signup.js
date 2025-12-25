'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  function setAuthCookie(value) {
    const maxAge = 60 * 60 * 24 * 30;
    document.cookie = `staqk_auth=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  }

  async function createAccount(e) {
    e.preventDefault();
    setErr('');
    if (!name) return setErr('Full name is required.');
    if (!email) return setErr('Email is required.');
    if (!agree) return setErr('Please accept Terms to continue.');
    setLoading(true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      if (!r.ok) {
        const token = 'staqk_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        setAuthCookie(token);
      }
      localStorage.setItem('staqk_user', JSON.stringify({ email, name }));
      router.replace('/home');
    } catch {
      setErr('Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center bg-slate-50 text-slate-900 px-4">
      <form onSubmit={createAccount} className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-sm p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-slate-500">Start by entering your details.</p>

        <label className="mt-6 block text-sm">
          <span className="mb-1 block">Full - name</span>
          <input
            value={name}
            onChange={(e)=>setName(e.target.value)}
            placeholder="Henry Jones"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none
                       focus:ring-4 focus:ring-slate-200 focus:border-slate-400"
          />
        </label>

        <label className="mt-4 block text-sm">
          <span className="mb-1 block">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none
                       focus:ring-4 focus:ring-slate-200 focus:border-slate-400"
          />
        </label>

        <label className="mt-4 block text-sm">
          <span className="mb-1 block">Password</span>
          <input
            type="password"
            placeholder="Create a password"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none
                       focus:ring-4 focus:ring-slate-200 focus:border-slate-400"
          />
        </label>

        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={agree} onChange={(e)=>setAgree(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
          <span className="text-slate-600">I agree to Terms &amp; Privacy</span>
        </label>

        {err && <p className="mt-3 text-sm text-rose-600">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-slate-900 text-white py-3 font-medium hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? 'Please wait…' : 'Create account'}
        </button>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <a href="/" className="text-slate-900 font-medium underline underline-offset-4">
            Sign in
          </a>
        </p>
      </form>
    </main>
  );
}
