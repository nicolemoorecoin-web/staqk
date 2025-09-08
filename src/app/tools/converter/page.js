"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiRefreshCw, FiRepeat } from "react-icons/fi";

const FIAT = ["USD", "EUR", "NGN"];
const CRYPTO = ["BTC", "ETH", "SOL", "USDT"];
const ALL = [...FIAT, ...CRYPTO];

// Fallback rates relative to USD (so USD=1, EUR≈0.92, NGN≈1600; crypto as 1 / USD price)
const FALLBACK = {
  USD: 1,
  EUR: 0.92,
  NGN: 1600,
  BTC: 1 / 65000,
  ETH: 1 / 3500,
  SOL: 1 / 160,
  USDT: 1,
};

export default function ConverterPage() {
  const router = useRouter();
  const [base, setBase] = useState("USD");     // from
  const [quote, setQuote] = useState("BTC");   // to
  const [amount, setAmount] = useState("100");
  const [rates, setRates] = useState(FALLBACK);
  const [loading, setLoading] = useState(false);
  const [ts, setTs] = useState(null);

  // Defaults from Settings
  useEffect(() => {
    const f = localStorage.getItem("pref.fiat");
    const c = localStorage.getItem("pref.crypto");
    if (f && FIAT.includes(f)) setBase(f);
    if (c && CRYPTO.includes(c)) setQuote(c);
  }, []);

  // Fetch live rates (CoinGecko). Falls back silently on error.
  async function fetchRates() {
    try {
      setLoading(true);
      const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether&vs_currencies=usd,eur,ngn";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Bad status");
      const j = await res.json();
      const next = { ...FALLBACK };

      // crypto 1/USD price
      next.BTC = 1 / j.bitcoin.usd;
      next.ETH = 1 / j.ethereum.usd;
      next.SOL = 1 / j.solana.usd;
      next.USDT = 1 / j.tether.usd;

      // fiat multipliers per USD (use USDT as proxy)
      next.EUR = j.tether.eur;
      next.NGN = j.tether.ngn;

      setRates(next);
      setTs(new Date().toISOString());
    } catch (_) {
      // keep FALLBACK
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRates();
    const t = setInterval(fetchRates, 60_000);
    return () => clearInterval(t);
  }, []);

  // Convert A -> B by going through USD using our rate convention
  const result = useMemo(() => {
    const amt = Number(amount || 0);
    if (!amt || !rates[base] || !rates[quote]) return "0";
    const toUSD = (unit, val) => val / rates[unit];
    const fromUSD = (unit, usd) => usd * rates[unit];
    const out = fromUSD(quote, toUSD(base, amt));
    const decimals = CRYPTO.includes(quote) ? 8 : 2;
    return out.toLocaleString(undefined, { maximumFractionDigits: decimals });
  }, [amount, base, quote, rates]);

  function swap() {
    setBase(quote);
    setQuote(base);
  }

  return (
    <main className="bg-[#10141c] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-[#10141c]/95 backdrop-blur z-10">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
          <FiArrowLeft size={22} />
        </button>
        <h1 className="text-white text-lg font-bold">Converter</h1>
        <button
          onClick={fetchRates}
          className={`text-blue-300 hover:text-blue-200 ${loading ? "animate-spin" : ""}`}
          title="Refresh rates"
        >
          <FiRefreshCw size={18} />
        </button>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-5">
        {/* From */}
        <Field label="From">
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
            />
            <select
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="bg-[#0f1424] border border-blue-900/30 rounded-lg px-2 py-2 text-white"
            >
              {ALL.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </Field>

        {/* Swap */}
        <div className="flex justify-center">
          <button
            onClick={swap}
            className="p-2 rounded-full bg-[#0f1424] border border-blue-900/30 text-gray-200 hover:bg-[#162042] transition"
            title="Swap"
          >
            <FiRepeat />
          </button>
        </div>

        {/* To */}
        <Field label="To">
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              value={result}
              readOnly
              className="bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
            />
            <select
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="bg-[#0f1424] border border-blue-900/30 rounded-lg px-2 py-2 text-white"
            >
              {ALL.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </Field>

        <div className="text-xs text-gray-500">
          {ts ? <>Rates updated: {new Date(ts).toLocaleTimeString()}</> : "Using fallback rates until live fetch succeeds."}
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-gray-300 text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}
