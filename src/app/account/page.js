// src/app/account/page.js
"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useWalletStore } from "../../lib/walletStore";
import { useAppPrefs } from "../components/AppPrefsProvider";
import {
  FaWallet,
  FaCoins,
  FaChartLine,
  FaLock,
  FaArrowUp,
  FaArrowDown,
  FaExchangeAlt,
  FaSyncAlt,
} from "react-icons/fa";
import { IoMdEye } from "react-icons/io";

/* ---------- tiny chart components (DONUT) ---------- */
function Donut({ segments, size = 84, stroke = 10 }) {
  const total = segments.reduce((s, x) => s + (Number(x.value) || 0), 0) || 1;
  const cx = size / 2,
    cy = size / 2,
    r = (size - stroke) / 2;
  let acc = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,.07)"
        strokeWidth={stroke}
      />
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        {segments.map((s, i) => {
          const pct = (Number(s.value) || 0) / total;
          const dash = 2 * Math.PI * r * pct;
          const gap = 2 * Math.PI * r - dash;
          const dashArray = `${dash} ${gap}`;
          const dashOffset = 2 * Math.PI * r * (1 - acc / total);
          acc += Number(s.value) || 0;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              opacity="0.95"
            />
          );
        })}
      </g>
    </svg>
  );
}

function Sparkline({ data, color = "#3b82f6" }) {
  if (!data?.length) return null;
  const w = 60,
    h = 24;
  const min = Math.min(...data),
    max = Math.max(...data);
  const pts = data
    .map((v, i) => {
      const x = (i * w) / (data.length - 1 || 1);
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={pts} opacity="0.85" />
    </svg>
  );
}

function ActionLink({ href, icon, label }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-[#161b26] hover:bg-blue-900/20 text-white font-semibold text-sm shadow transition-all py-3"
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

/* ---------- local page translations (keeps your UI intact) ---------- */
const L10N = {
  en: {
    totalBalance: "Total Balance",
    viewActivity: "View Activity",
    hide: "Hide",
    show: "Show",
    lastUpdated: "Last updated",
    lastUpdatedJustNow: "Last updated just now",
    today: "Today",
    deposit: "Deposit",
    withdraw: "Withdraw",
    transfer: "Transfer",
    swap: "Swap",
  },
  es: {
    totalBalance: "Saldo total",
    viewActivity: "Ver actividad",
    hide: "Ocultar",
    show: "Mostrar",
    lastUpdated: "Actualizado",
    lastUpdatedJustNow: "Actualizado hace un momento",
    today: "Hoy",
    deposit: "Depositar",
    withdraw: "Retirar",
    transfer: "Transferir",
    swap: "Cambiar",
  },
  fr: {
    totalBalance: "Solde total",
    viewActivity: "Voir l’activité",
    hide: "Masquer",
    show: "Afficher",
    lastUpdated: "Dernière mise à jour",
    lastUpdatedJustNow: "Mis à jour à l’instant",
    today: "Aujourd’hui",
    deposit: "Dépôt",
    withdraw: "Retrait",
    transfer: "Transfert",
    swap: "Échanger",
  },
  de: {
    totalBalance: "Gesamtsaldo",
    viewActivity: "Aktivität ansehen",
    hide: "Ausblenden",
    show: "Anzeigen",
    lastUpdated: "Zuletzt aktualisiert",
    lastUpdatedJustNow: "Gerade aktualisiert",
    today: "Heute",
    deposit: "Einzahlen",
    withdraw: "Abheben",
    transfer: "Überweisen",
    swap: "Tauschen",
  },
  ar: {
    totalBalance: "إجمالي الرصيد",
    viewActivity: "عرض النشاط",
    hide: "إخفاء",
    show: "إظهار",
    lastUpdated: "آخر تحديث",
    lastUpdatedJustNow: "تم التحديث الآن",
    today: "اليوم",
    deposit: "إيداع",
    withdraw: "سحب",
    transfer: "تحويل",
    swap: "مبادلة",
  },
  zh: {
    totalBalance: "总余额",
    viewActivity: "查看活动",
    hide: "隐藏",
    show: "显示",
    lastUpdated: "更新时间",
    lastUpdatedJustNow: "刚刚更新",
    today: "今天",
    deposit: "充值",
    withdraw: "提现",
    transfer: "转账",
    swap: "兑换",
  },
};

function pickLang(code) {
  const k = String(code || "en").toLowerCase();
  return L10N[k] ? k : "en";
}

export default function AccountPage() {
  const { language, fiatCurrency, formatMoney, locale } = useAppPrefs();
  const T = L10N[pickLang(language)];

  const hydrated = useWalletStore((s) => s._hydrated);
  const storeBalances = useWalletStore((s) => s.balances);
  const setBalances = useWalletStore((s) => s.setBalances);

  // Hydrate from server so Account & Dashboard agree.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch("/api/account/summary", { cache: "no-store" });
        if (!r.ok) return;
        const j = await r.json();
        if (!mounted) return;
        setBalances({
          income: j.incomeUsd,
          expense: j.expenseUsd,
          buckets: j.buckets,
        });
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [setBalances]);

  const [showBalance, setShowBalance] = useState(true);
  useEffect(() => {
    const saved = sessionStorage.getItem("showBalance");
    if (saved !== null) setShowBalance(saved === "1");
  }, []);
  useEffect(() => {
    sessionStorage.setItem("showBalance", showBalance ? "1" : "0");
  }, [showBalance]);

  const [lastUpdated, setLastUpdated] = useState(null);
  useEffect(() => {
    if (storeBalances) setLastUpdated(new Date());
  }, [storeBalances]);

  // ✅ Activate time filters (UI + persistent)
  const RANGES = ["24H", "1W", "1M", "3M", "6M"];
  const [range, setRange] = useState("1W");
  useEffect(() => {
    const saved = sessionStorage.getItem("account.range");
    if (saved && RANGES.includes(saved)) setRange(saved);
  }, []);
  useEffect(() => {
    sessionStorage.setItem("account.range", range);
  }, [range]);

  // ✅ Totals: cash + crypto + staking + investments + earn
  const effective = useMemo(() => {
    const sb = storeBalances || {};
    const buckets = {
      crypto: Number(sb.buckets?.crypto ?? 0),
      cash: Number(sb.buckets?.cash ?? 0),
      staking: Number(sb.buckets?.staking ?? 0),
      investments: Number(sb.buckets?.investments ?? 0),
      earn: Number(sb.buckets?.earn ?? 0),
    };

    const total =
      (Number(buckets.cash) || 0) +
      (Number(buckets.crypto) || 0) +
      (Number(buckets.staking) || 0) +
      (Number(buckets.investments) || 0) +
      (Number(buckets.earn) || 0);

    return { total, buckets };
  }, [storeBalances]);

  const ASSETS = useMemo(() => {
    const b = effective.buckets || {};
    const rows = [
      {
        name: "Crypto",
        icon: <FaCoins className="w-7 h-7 text-blue-400" />,
        color: "#3b82f6",
        spark: [100, 102, 104, 102, 108, 111, 110],
        value: Number(b.crypto ?? 0),
      },
      {
        name: "Cash",
        icon: <FaWallet className="w-7 h-7 text-green-400" />,
        color: "#10b981",
        spark: [900, 930, 920, 960, 930, 970, 980],
        value: Number(b.cash ?? 0),
      },
      {
        name: "Investment Wallet",
        icon: <FaChartLine className="w-7 h-7 text-yellow-300" />,
        color: "#fbbf24",
        spark: [500, 505, 510, 520, 540, 550, 600],
        value: Number(b.investments ?? 0),
      },
      {
        name: "Staking",
        icon: <FaLock className="w-7 h-7 text-pink-300" />,
        color: "#f472b6",
        spark: [0, 5, 15, 30, 40, 50, 45],
        value: Number(b.staking ?? 0),
      },
      {
        name: "Crypto Earn",
        icon: <FaChartLine className="w-7 h-7 text-purple-300" />,
        color: "#a78bfa",
        spark: [1000, 1001, 1002, 1001, 1005, 1010, 1008],
        value: Number(b.earn ?? 0),
      },
    ];

    const sum = rows.reduce((s, a) => s + a.value, 0) || 1;
    rows.forEach((a) => {
      a.percent = Math.round((a.value / sum) * 100);
    });
    return rows;
  }, [effective]);

  const total = effective.total;

  const lastUpdatedLabel = lastUpdated
    ? `${T.lastUpdated} ${lastUpdated.toLocaleTimeString(locale || undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : T.lastUpdatedJustNow;

  if (!hydrated) {
    return (
      <main className="bg-[#10141c] min-h-screen p-6">
        <section className="max-w-2xl mx-auto w-full mt-4">
          <div className="rounded-3xl bg-[#161b26]/70 border border-blue-900/50 p-6 animate-pulse">
            <div className="h-4 w-32 bg-white/10 rounded mb-3" />
            <div className="h-10 w-64 bg-white/10 rounded" />
          </div>
        </section>
      </main>
    );
  }

  const donutSegments = ASSETS.map((a) => ({ value: a.value, color: a.color }));

  return (
    <main className="bg-[#10141c] min-h-screen pb-32 px-0 pt-2 font-sans">
      {/* Summary */}
      <section className="max-w-2xl mx-auto w-full mt-4 mb-7">
        <div className="rounded-3xl shadow-2xl bg-[#161b26]/70 border border-blue-900/50 backdrop-blur-lg p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-lg text-gray-300 font-medium">{T.totalBalance}</span>
            <div className="flex items-center gap-3">
              <Link
                href="/transactions"
                className="text-blue-300 hover:text-blue-200 text-sm font-semibold"
              >
                {T.viewActivity}
              </Link>
              <button
                onClick={() => setShowBalance((v) => !v)}
                className="text-blue-400 text-sm font-semibold hover:text-blue-300"
              >
                <IoMdEye className="inline-block mr-1" /> {showBalance ? T.hide : T.show}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {showBalance ? formatMoney(total, { maximumFractionDigits: 2 }) : "******"}
              <span className="text-lg font-medium text-gray-400 ml-2">
                {showBalance ? String(fiatCurrency || "").toUpperCase() : ""}
              </span>
            </span>
            <Donut segments={donutSegments} />
          </div>

          <div className="text-gray-400 text-sm mb-1">
            +2.24% {T.today?.toLowerCase?.() || "today"} • {lastUpdatedLabel}
          </div>
        </div>
      </section>

      {/* Filters (ACTIVE) */}
      <div className="flex justify-center gap-2 mb-7 px-4">
        {RANGES.map((f) => {
          const active = range === f;
          return (
            <button
              key={f}
              onClick={() => setRange(f)}
              className={[
                "px-4 py-1 rounded-full border text-sm font-semibold transition",
                active
                  ? "bg-blue-600 border-blue-500 text-white shadow"
                  : "bg-transparent border-blue-900/40 text-blue-200 hover:bg-blue-900/20",
              ].join(" ")}
              aria-pressed={active}
              type="button"
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Actions (4 buttons) */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="grid grid-cols-4 gap-2">
          <ActionLink href="/account/deposit" icon={<FaArrowUp />} label={T.deposit} />
          <ActionLink href="/account/withdraw" icon={<FaArrowDown />} label={T.withdraw} />
          <ActionLink href="/account/transfer" icon={<FaExchangeAlt />} label={T.transfer} />
          <ActionLink href="/account/swap" icon={<FaSyncAlt />} label={T.swap} />
        </div>
      </div>

      {/* Asset cards */}
      <section className="max-w-2xl mx-auto w-full flex flex-col gap-4 px-4 mt-8">
        {ASSETS.map((a) => (
          <div
            key={a.name}
            className="bg-[#181d2b] rounded-2xl flex items-center justify-between px-5 py-4 shadow-md hover:bg-blue-900/10 transition"
          >
            <div className="flex items-center gap-4">
              <span>{a.icon}</span>
              <div>
                <div className="text-white font-semibold text-lg">{a.name}</div>
                <div className="text-gray-500 text-xs">{a.percent}% of portfolio</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xl font-bold text-white">
                {showBalance ? formatMoney(a.value, { maximumFractionDigits: 2 }) : "****"}
              </span>
              <span className="text-gray-500 text-xs">{T.today}</span>
              <Sparkline data={a.spark} color={a.color} />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
