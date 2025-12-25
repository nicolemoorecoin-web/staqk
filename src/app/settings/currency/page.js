"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCheck } from "react-icons/fi";

const FIAT = ["USD", "EUR", "GBP", "AUD", "JPY", "CAD", "NGN"];
const CRYPTO = ["BTC", "ETH", "USDT", "SOL"];

export default function CurrencySettingsPage() {
  const router = useRouter();
  const [fiat, setFiat] = useState("USD");
  const [crypto, setCrypto] = useState("BTC");
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/me/preferences", { cache: "no-store" });
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.ok) {
          if (j.fiatCurrency) setFiat(j.fiatCurrency);
          if (j.cryptoCurrency) setCrypto(j.cryptoCurrency);

          localStorage.setItem("pref.fiat", j.fiatCurrency || "USD");
          localStorage.setItem("pref.crypto", j.cryptoCurrency || "BTC");
          return;
        }
      } catch {}

      const f = localStorage.getItem("pref.fiat");
      const c = localStorage.getItem("pref.crypto");
      if (f) setFiat(f);
      if (c) setCrypto(c);
    })();
  }, []);

  async function save(next) {
    setErr(null);

    // optimistic + local mirror
    if (next.fiatCurrency) {
      setFiat(next.fiatCurrency);
      localStorage.setItem("pref.fiat", next.fiatCurrency);
    }
    if (next.cryptoCurrency) {
      setCrypto(next.cryptoCurrency);
      localStorage.setItem("pref.crypto", next.cryptoCurrency);
    }

    // ✅ notify same-tab listeners (global provider)
    window.dispatchEvent(new CustomEvent("staqk:prefs-updated", { detail: next }));

    try {
      const r = await fetch("/api/me/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || "Failed to save");
    } catch (e) {
      setErr(e.message || "Could not save");
    }
  }

  return (
    <main className="bg-[#10141c] min-h-screen">
      <div className="flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-[#10141c]/95 backdrop-blur z-10">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
          <FiArrowLeft size={22} />
        </button>
        <h1 className="text-white text-lg font-bold">Default Currencies</h1>
        <div className="w-6" />
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        <section>
          <h2 className="text-white font-semibold mb-3">Fiat</h2>
          <div className="grid grid-cols-3 gap-2">
            {FIAT.map((f) => (
              <button
                key={f}
                onClick={() => save({ fiatCurrency: f })}
                className={`px-3 py-2 rounded-xl border transition
                  ${
                    fiat === f
                      ? "border-blue-600 bg-blue-600/10 text-white"
                      : "border-blue-900/30 bg-[#151a28] text-gray-200 hover:bg-white/5"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span>{f}</span>
                  {fiat === f && <FiCheck className="text-blue-400" />}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-3">Crypto</h2>
          <div className="grid grid-cols-3 gap-2">
            {CRYPTO.map((c) => (
              <button
                key={c}
                onClick={() => save({ cryptoCurrency: c })}
                className={`px-3 py-2 rounded-xl border transition
                  ${
                    crypto === c
                      ? "border-blue-600 bg-blue-600/10 text-white"
                      : "border-blue-900/30 bg-[#151a28] text-gray-200 hover:bg-white/5"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span>{c}</span>
                  {crypto === c && <FiCheck className="text-blue-400" />}
                </div>
              </button>
            ))}
          </div>
        </section>

        {err && (
          <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {err}
          </div>
        )}

        <p className="text-xs text-gray-500">
          Saved to your account (database) and mirrored locally for fast UI updates.
        </p>
      </div>
    </main>
  );
}
