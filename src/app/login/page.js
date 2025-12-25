"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/home";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!agree) return setError("Please accept Terms to continue.");
    startTransition(async () => {
      const res = await signIn("credentials", { email, password, redirect: false, callbackUrl: next });
      if (res?.error) setError("Invalid email or password");
      else router.replace(next);
    });
  }

  return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 [mask-image:radial-gradient(60%_40%_at_50%_0%,black,transparent)]">
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_50%_0%,#93c5fd33,transparent_60%)]" />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 ring-1 ring-sky-400/30">
            <span className="text-sky-300 text-xl">🚀</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">STAQKS</h1>
          <p className="mt-1 text-slate-400">Welcome back • Secure wallet access</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-2xl">
          <label className="block text-sm">
            <span className="text-slate-300">Email</span>
            <input
              type="email" required value={email} onChange={e=>setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2.5 outline-none focus:ring-4 focus:ring-sky-500/20"
              placeholder="you@example.com"
            />
          </label>

          <label className="mt-4 block text-sm">
            <span className="text-slate-300">Password</span>
            <input
              type="password" required value={password} onChange={e=>setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2.5 outline-none focus:ring-4 focus:ring-sky-500/20"
              placeholder="••••••••"
            />
          </label>

          <div className="mt-3 flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 text-slate-400">
              <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)}
                     className="h-4 w-4 rounded border-white/20 bg-slate-900" />
              I agree to Terms & Privacy
            </label>
            <a className="text-sky-300 hover:text-sky-200" href="#">Forgot password</a>
          </div>

          {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

          <button type="submit" disabled={isPending}
                  className="mt-5 w-full rounded-xl bg-sky-500 text-slate-900 font-medium py-3 hover:bg-sky-400 disabled:opacity-60">
            {isPending ? "Signing in…" : "Login"}
          </button>

          <div className="mt-4 text-center text-sm text-slate-400">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-sky-300 hover:text-sky-200 underline underline-offset-4">
              Sign up for free
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
