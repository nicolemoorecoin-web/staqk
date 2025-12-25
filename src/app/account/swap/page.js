// src/app/account/swap/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiMoreVertical, FiRefreshCw } from "react-icons/fi";
import { HiArrowDown } from "react-icons/hi";
import { FaWallet, FaCoins, FaChartLine, FaLock } from "react-icons/fa";
import { useWalletStore } from "../../../lib/walletStore";
import { useAppPrefs } from "../../components/AppPrefsProvider";

const BUCKETS = [
  {
    key: "cash",
    label: "Cash",
    chip: "CASH",
    icon: <FaWallet className="text-2xl text-white" />,
    color: "#10b981",
  },
  {
    key: "crypto",
    label: "Crypto",
    chip: "CRYPTO",
    icon: <FaCoins className="text-2xl text-white" />,
    color: "#3b82f6",
  },
  {
    key: "investments",
    label: "Investment Wallet",
    chip: "INVEST",
    icon: <FaChartLine className="text-2xl text-white" />,
    color: "#fbbf24",
    disabled: true, // 🔒 reserved ledger bucket
    disabledHint: "Use Investments page to move funds in/out.",
  },
  {
    key: "staking",
    label: "Staking",
    chip: "STAKE",
    icon: <FaLock className="text-2xl text-white" />,
    color: "#f472b6",
  },
  {
    key: "earn",
    label: "Crypto Earn",
    chip: "EARN",
    icon: <FaChartLine className="text-2xl text-white" />,
    color: "#a78bfa",
  },
];

const byKey = (k) => BUCKETS.find((b) => b.key === k) || BUCKETS[0];
const isDisabled = (k) => !!byKey(k)?.disabled;

export default function SwapPage() {
  const router = useRouter();
  const { formatMoney } = useAppPrefs();

  const balances = useWalletStore((s) => s.balances);
  const setBalances = useWalletStore((s) => s.setBalances);

  const [from, setFrom] = useState("cash");
  const [to, setTo] = useState("crypto");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [focus, setFocus] = useState("from");

  const buckets = balances?.buckets || {};

  const fromBal = Number(buckets?.[from] ?? 0);
  const toBal = Number(buckets?.[to] ?? 0);

  // If someone lands here with investments selected (old state), force back to liquid buckets
  useEffect(() => {
    if (isDisabled(from)) setFrom("cash");
    if (isDisabled(to)) setTo(from === "crypto" ? "cash" : "crypto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // prevent same bucket
  useEffect(() => {
    if (from === to) {
      const next = BUCKETS.find((b) => b.key !== from && !b.disabled)?.key || "crypto";
      setTo(next);
    }
  }, [from, to]);

  const amountNum = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  const canSubmit = amountNum > 0 && from !== to && amountNum <= fromBal && !busy;

  const fromMeta = byKey(from);
  const toMeta = byKey(to);

  async function refreshSummary() {
    try {
      const r = await fetch("/api/account/summary", { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j?.ok) {
        setBalances({ buckets: j.buckets, income: j.incomeUsd, expense: j.expenseUsd });
      }
    } catch {}
  }

  function flip() {
    setErr("");
    if (isDisabled(from) || isDisabled(to)) {
      setErr("Investment Wallet can’t be swapped. Use Investments page instead.");
      return;
    }
    setFrom((prevFrom) => {
      const oldFrom = prevFrom;
      setTo(oldFrom);
      return to;
    });
  }

  async function onSwap() {
    setErr("");

    if (isDisabled(from) || isDisabled(to)) {
      return setErr("Investment Wallet is managed. Use the Investments page to move funds.");
    }
    if (from === to) return setErr("Choose two different wallets.");
    if (!amountNum || amountNum <= 0) return setErr("Enter a valid amount.");
    if (amountNum > fromBal) return setErr("No balance in selected wallet.");

    setBusy(true);
    try {
      const res = await fetch("/api/wallet/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, amount: amountNum }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.error || "Swap failed");

      // update immediately if API returned buckets, then refresh summary for full correctness
      if (data?.buckets) setBalances({ buckets: data.buckets });
      await refreshSummary();

      router.replace("/account");
    } catch (e) {
      setErr(e?.message || "Swap failed");
    } finally {
      setBusy(false);
    }
  }

  const popular = useMemo(() => {
    return BUCKETS.map((b) => ({
      ...b,
      value: Number(buckets?.[b.key] ?? 0),
      pct: b.key === "crypto" ? "+1.65%" : "0.00%",
    }));
  }, [buckets]);

  function applyPopular(key) {
    setErr("");
    if (isDisabled(key)) {
      setErr("Investment Wallet is managed. Use Investments page to move funds.");
      return;
    }
    if (focus === "from") setFrom(key);
    else setTo(key);
  }

  return (
    <main className="bg-[#10141c] min-h-screen pb-28">
      <div className="sticky top-0 z-20 bg-[#10141c]/90 backdrop-blur border-b border-white/5">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-300 hover:text-white"
            type="button"
            aria-label="Back"
          >
            <FiArrowLeft size={22} />
          </button>

          <div className="px-4 py-2 rounded-full bg-blue-600/15 text-blue-200 font-semibold border border-blue-500/30">
            Swap
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={refreshSummary}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-sm"
              type="button"
            >
              <FiRefreshCw /> Refresh
            </button>

            <button
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200"
              type="button"
              aria-label="More"
            >
              <FiMoreVertical size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-5">
        {(isDisabled(from) || isDisabled(to)) && (
          <div className="mb-4 text-sm text-amber-200 bg-amber-900/20 border border-amber-900/30 rounded-xl px-3 py-2">
            Investment Wallet is managed. Move funds using the Investments page (Deposit/Withdraw).
          </div>
        )}

        <div className="relative">
          {/* FROM */}
          <section
            onClick={() => setFocus("from")}
            className={[
              "rounded-2xl bg-[#151a28] border shadow-xl p-4",
              focus === "from" ? "border-blue-500/40" : "border-blue-900/25",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <div className="text-gray-300 text-sm font-semibold">
                From <span className="text-gray-500">•</span>{" "}
                <span className="text-gray-200">{fromMeta.label}</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/6 border border-white/10 text-xs text-gray-200">
                My {fromMeta.label}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-full grid place-items-center"
                  style={{ backgroundColor: `${fromMeta.color}` }}
                >
                  {fromMeta.icon}
                </div>

                <div>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    inputMode="decimal"
                    placeholder="0"
                    className="w-44 bg-transparent text-5xl font-extrabold tracking-tight text-white outline-none"
                  />
                  <div className="text-gray-400 text-sm">
                    {formatMoney(amountNum || 0, { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="bg-white/6 text-white font-semibold px-3 py-2 rounded-xl border border-white/10 outline-none"
                >
                  {BUCKETS.map((b) => (
                    <option key={b.key} value={b.key} disabled={!!b.disabled}>
                      {b.chip}
                      {b.disabled ? " (Managed)" : ""}
                    </option>
                  ))}
                </select>

                <div className="mt-2 text-gray-400 text-sm">
                  {fromBal > 0 ? (
                    <>
                      Available{" "}
                      <span className="text-gray-200">
                        {formatMoney(fromBal, { maximumFractionDigits: 2 })}
                      </span>
                    </>
                  ) : (
                    "No balance"
                  )}
                </div>
              </div>
            </div>
          </section>

          <button
            onClick={flip}
            type="button"
            aria-label="Flip swap direction"
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2
                       h-12 w-12 rounded-full grid place-items-center
                       bg-[#0b1020] border border-white/10 shadow-xl hover:bg-[#0f1630]"
          >
            <HiArrowDown className="text-blue-300 text-2xl" />
          </button>

          {/* TO */}
          <section
            onClick={() => setFocus("to")}
            className={[
              "rounded-2xl bg-[#151a28] border shadow-xl p-4 mt-4",
              focus === "to" ? "border-blue-500/40" : "border-blue-900/25",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <div className="text-gray-300 text-sm font-semibold">
                To <span className="text-gray-500">•</span>{" "}
                <span className="text-gray-200">{toMeta.label}</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/6 border border-white/10 text-xs text-gray-200">
                My {toMeta.label}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-full grid place-items-center"
                  style={{ backgroundColor: `${toMeta.color}` }}
                >
                  {toMeta.icon}
                </div>

                <div>
                  <div className="text-5xl font-extrabold tracking-tight text-white leading-none">
                    {amountNum ? amountNum : 0}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {formatMoney(amountNum || 0, { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="bg-white/6 text-white font-semibold px-3 py-2 rounded-xl border border-white/10 outline-none"
                >
                  {BUCKETS.filter((b) => b.key !== from).map((b) => (
                    <option key={b.key} value={b.key} disabled={!!b.disabled}>
                      {b.chip}
                      {b.disabled ? " (Managed)" : ""}
                    </option>
                  ))}
                </select>

                <div className="mt-2 text-gray-400 text-sm">
                  Current{" "}
                  <span className="text-gray-200">
                    {formatMoney(toBal, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {err && (
          <div className="mt-4 text-sm text-rose-300 bg-rose-900/20 border border-rose-900/30 rounded-xl px-3 py-2">
            {err}
          </div>
        )}

        <button
          onClick={onSwap}
          disabled={!canSubmit}
          className="mt-5 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-semibold py-4 transition shadow-xl"
          type="button"
        >
          {busy ? "Swapping…" : "Swap"}
        </button>

        <div className="mt-8">
          <div className="text-white text-lg font-bold mb-3">Popular assets</div>

          <div className="space-y-3">
            {popular.map((p) => (
              <button
                key={p.key}
                onClick={() => applyPopular(p.key)}
                type="button"
                className={[
                  "w-full text-left rounded-2xl bg-[#151a28] border transition shadow-md px-4 py-4",
                  p.disabled
                    ? "border-white/10 opacity-60 cursor-not-allowed"
                    : "border-blue-900/25 hover:bg-blue-900/10",
                ].join(" ")}
                disabled={!!p.disabled}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-11 w-11 rounded-full grid place-items-center flex-none"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-bold leading-tight truncate">
                        {p.chip} {p.disabled ? "• Managed" : ""}
                      </div>
                      <div className="text-gray-400 text-sm truncate">{p.label}</div>
                      {p.disabledHint ? (
                        <div className="text-[11px] text-gray-500 mt-0.5">{p.disabledHint}</div>
                      ) : null}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-white font-extrabold">
                      {formatMoney(p.value, { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-400">{p.pct}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Tip: Tap a “Popular asset” to set the {focus === "from" ? "From" : "To"} wallet.
          </div>
        </div>

        <div className="h-10" />
      </div>
    </main>
  );
}
