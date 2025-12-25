// src/app/components/StaqksWelcome.js
"use client";

import Link from "next/link";

export default function StaqksWelcome() {
  return (
    <main className="min-h-[100dvh] bg-[#0b1020] relative overflow-hidden">
      {/* Background collage (placeholder tiles you can swap for images later) */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid grid-cols-3 gap-4 p-8 opacity-35 blur-[0.2px]">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl bg-white/10 border border-white/10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 30%, rgba(255,255,255,.18), transparent 55%), linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.03))",
              }}
            />
          ))}
        </div>

        {/* Blue overlay like the screenshot */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/70 via-blue-600/70 to-[#0b1020]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020] via-transparent to-transparent"></div>
      </div>

      {/* Top-left close button (optional) */}
      <div className="relative z-10 p-5">
        <button
          type="button"
          aria-label="Close"
          className="h-10 w-10 rounded-full bg-white/15 border border-white/20 text-white grid place-items-center hover:bg-white/20 transition"
          onClick={() => {}}
        >
          ✕
        </button>
      </div>

      {/* Bottom card content */}
      <section className="relative z-10 px-5 pb-10 flex min-h-[calc(100dvh-80px)] items-end">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-white text-3xl font-extrabold tracking-tight">
              STAQKS TRADING
            </h1>
            <p className="text-white/80 mt-2">
              Stack smarter. Move faster.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full h-12 rounded-xl bg-white text-[#0b1020] font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <span className="inline-flex items-center justify-center w-5">✉️</span>
              Sign in with Email
            </Link>

            {/* Google button (wire to NextAuth later if you want) */}
            <Link
              href="/login?provider=google"
              className="w-full h-12 rounded-xl bg-transparent text-white font-bold flex items-center justify-center gap-2 border border-white/35 hover:bg-white/10 transition"
            >
              <span className="inline-flex items-center justify-center w-5">G</span>
              Sign in with Google
            </Link>
          </div>

          <p className="text-center text-white/80 text-sm mt-6">
            Doesn’t have account?{" "}
            <Link href="/signup" className="text-white font-extrabold underline underline-offset-4">
              Sign Up Now
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
