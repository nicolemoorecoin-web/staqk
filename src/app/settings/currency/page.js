"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCheck } from "react-icons/fi";

const FIAT = ["USD", "EUR", "NGN"];
const CRYPTO = ["BTC", "ETH", "USDT", "SOL"];

export default function CurrencySettingsPage() {
  const router = useRouter();
  const [fiat, setFiat] = useState("USD");
  const [crypto, setCrypto] = useState("BTC");

  useEffect(() => {
    const f = localStorage.getItem("pref.fiat");
    const c = localStorage.getItem("pref.crypto");
    if (f) setFiat(f);
    if (c) setCrypto(c);
  }, []);

  function chooseFiat(x) {
    setFiat(x);
    localStorage.setItem("pref.fiat", x);
  }
  function chooseCrypto(x) {
    setCrypto(x);
    localStorage.setItem("pref.crypto", x);
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
        {/* Fiat */}
        <section>
          <h2 className="text-white font-semibold mb-3">Fiat</h2>
          <div className="grid grid-cols-3 gap-2">
            {FIAT.map((f) => (
              <button
                key={f}
                onClick={() => chooseFiat(f)}
                className={`px-3 py-2 rounded-xl border transition
                  ${fiat === f ? "border-blue-600 bg-blue-600/10 text-white" : "border-blue-900/30 bg-[#151a28] text-gray-200 hover:bg-white/5"}`}
              >
                <div className="flex items-center justify-between">
                  <span>{f}</span>
                  {fiat === f && <FiCheck className="text-blue-400" />}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Crypto */}
        <section>
          <h2 className="text-white font-semibold mb-3">Crypto</h2>
          <div className="grid grid-cols-3 gap-2">
            {CRYPTO.map((c) => (
              <button
                key={c}
                onClick={() => chooseCrypto(c)}
                className={`px-3 py-2 rounded-xl border transition
                  ${crypto === c ? "border-blue-600 bg-blue-600/10 text-white" : "border-blue-900/30 bg-[#151a28] text-gray-200 hover:bg-white/5"}`}
              >
                <div className="flex items-center justify-between">
                  <span>{c}</span>
                  {crypto === c && <FiCheck className="text-blue-400" />}
                </div>
              </button>
            ))}
          </div>
        </section>

        <p className="text-xs text-gray-500">
          Your selections are saved to this device and used as defaults across the app (e.g., Converter).
        </p>
      </div>
    </main>
  );
}
