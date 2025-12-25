"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/home";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(true);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!agree) return setError("Please accept Terms to continue.");

    setLoading(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ name, email, password }),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok || j?.ok === false) throw new Error(j?.error || "Could not create account");

      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: next,
      });

      if (res?.error) setError("Account created, but sign-in failed.");
      else router.replace(next);
    } catch (e2) {
      setError(e2?.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 ring-1 ring-sky-400/30">
            <span className="text-sky-300 text-xl">🚀</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Create your STAQKS account</h1>
          <p className="mt-1 text-slate-400">Secure. Simple. Fast.</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-2xl">
          <label className="block text-sm">
            <span className="text-slate-300">Full name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-2 w-full rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2.5 outline-none focus:ring-4 focus:ring-sky-500/20"
              placeholder="John Doe"
            />
          </label>

          <label className="mt-4 block text-sm">
            <span className="text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2.5 outline-none focus:ring-4 focus:ring-sky-500/20"
              placeholder="you@example.com"
            />
          </label>

          <label className="mt-4 block text-sm">
            <span className="text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2.5 outline-none focus:ring-4 focus:ring-sky-500/20"
              placeholder="••••••••"
            />
          </label>

          <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-slate-900"
            />
            I agree to Terms & Privacy
          </label>

          {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-sky-500 text-slate-900 font-medium py-3 hover:bg-sky-400 disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create account"}
          </button>

          <p className="mt-4 text-sm text-slate-400 text-center">
            Already have an account?{" "}
            <a href={`/login?next=${encodeURIComponent(next)}`} className="text-sky-300 hover:text-sky-200 underline underline-offset-4">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
