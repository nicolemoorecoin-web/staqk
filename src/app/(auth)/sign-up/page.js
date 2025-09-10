"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get("redirect") || "/";

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    router.replace(redirect);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#10141c] px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-[#161b26] p-6 rounded-2xl space-y-4 shadow">
        <h1 className="text-white text-xl font-semibold">Sign in</h1>

        <input
          type="email"
          className="w-full rounded-lg bg-[#0f1420] border border-blue-900/40 p-2 text-white"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="w-full rounded-lg bg-[#0f1420] border border-blue-900/40 p-2 text-white"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {err && <p className="text-red-400 text-sm">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-gray-400 text-sm">
          No account?{" "}
          <Link className="text-blue-400 hover:underline" href="/sign-up">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}
