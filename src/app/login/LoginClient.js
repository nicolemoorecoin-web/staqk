"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginClient({ searchParams = {} }) {
  const router = useRouter();

  const next =
    typeof searchParams?.next === "string" && searchParams.next.length
      ? searchParams.next
      : "/home";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: next,
      });

      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.replace(next);
    } catch (e2) {
      setError(e2?.message || "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 ring-1 ring-sky-400/30">
            <span className="text-sky-300 text-xl">🔐</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-slate-400">Sign in to continue.</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-2xl"
        >
          <label className="block text-sm">
            <span className="text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2.5 outline-none focus:ring-4 focus:ring-sky-500/20"
              placeholder="you@example.com"
              autoComplete="email"
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
              autoComplete="current-password"
            />
          </label>

          {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-sky-500 text-slate-900 font-medium py-3 hover:bg-sky-400 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="mt-4 text-sm text-slate-400 text-center">
            Don’t have an account?{" "}
            <Link
              href={`/signup?next=${encodeURIComponent(next)}`}
              className="text-sky-300 hover:text-sky-200 underline underline-offset-4"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
