"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }, // store display name in user_metadata
    });
    setLoading(false);
    if (error) return setErr(error.message);

    // If email confirmation is ON in Supabase, the user must confirm the email.
    // Otherwise they'll already be signed in after signUp.
    router.replace("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#10141c] px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-[#161b26] p-6 rounded-2xl space-y-4 shadow">
        <h1 className="text-white text-xl font-semibold">Create account</h1>

        <input
          className="w-full rounded-lg bg-[#0f1420] border border-blue-900/40 p-2 text-white"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
          placeholder="Password (min 6 chars)"
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
          {loading ? "Creating…" : "Sign up"}
        </button>

        <p className="text-gray-400 text-sm">
          Already have an account?{" "}
          <Link className="text-blue-400 hover:underline" href="/sign-in">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
