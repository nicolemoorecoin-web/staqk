// src/app/home/components/RecentTransactions.js
"use client";

import { useMemo } from "react";
import {
  FiDownload,  // deposit
  FiUpload,    // withdraw
  FiArrowRight,// transfer
  FiClock,     // pending
  FiXCircle,   // failed
  FiCheckCircle// success
} from "react-icons/fi";

/**
 * RecentTransactions
 * Props:
 *  - items?: Array<{
 *      id: string|number,
 *      title: string,          // "USDT Deposit"
 *      note?: string,          // "Aug 2nd, 19:54:05" or tx hash short
 *      type: "deposit"|"withdraw"|"transfer",
 *      amount: number,         // positive numbers, we handle signs/colors
 *      currency?: string,      // default "USD"
 *      status?: "success"|"pending"|"failed",
 *      timestamp?: string|number|Date
 *    }>
 *  - loading?: boolean
 *  - onViewAll?: () => void
 */
export default function RecentTransactions({
  items,
  loading = false,
  onViewAll,
}) {
  // Safe demo data if none passed (so nothing breaks)
  const data = items?.length
    ? items
    : [
        {
          id: "tx1",
          title: "USDT Deposit",
          note: "Aug 2nd, 19:54:05",
          type: "deposit",
          amount: 350,
          currency: "USD",
          status: "success",
          timestamp: Date.now() - 1000 * 60 * 30,
        },
        {
          id: "tx2",
          title: "BTC Transfer to bc1qxy2kgd…3kwlh",
          note: "Aug 2nd, 19:53:52",
          type: "transfer",
          amount: -3500,
          currency: "USD",
          status: "success",
          timestamp: Date.now() - 1000 * 60 * 60,
        },
        {
          id: "tx3",
          title: "Card Purchase",
          note: "Aug 1st, 14:22:10",
          type: "withdraw",
          amount: -42.5,
          currency: "USD",
          status: "pending",
          timestamp: Date.now() - 1000 * 60 * 60 * 26,
        },
      ];

  // Group by day (Today / Yesterday / Date)
  const groups = useMemo(() => {
    const byDay = {};
    for (const it of data) {
      const d = new Date(it.timestamp || Date.now());
      const key = dayKey(d);
      byDay[key] ||= [];
      byDay[key].push(it);
    }
    // keep order newest -> oldest by group
    return Object.entries(byDay)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([k, arr]) => ({ label: labelForDay(new Date(k)), items: arr }));
  }, [JSON.stringify(data)]);

  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-base tracking-tight">Recent Transactions</h3>
        <button
          onClick={onViewAll}
          className="text-blue-300 hover:text-blue-200 text-sm font-semibold"
        >
          View all
        </button>
      </div>

      <div className="bg-[#141a29] rounded-2xl border border-blue-900/30 overflow-hidden">
        {loading ? (
          <SkeletonList />
        ) : (
          groups.map((g) => (
            <div key={g.label} className="px-3 sm:px-4 py-3 sm:py-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {g.label}
              </div>
              <ul className="flex flex-col gap-2">
                {g.items.map((t) => (
                  <TransactionRow key={t.id} tx={t} />
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/* ---------- Row ---------- */

function TransactionRow({ tx }) {
  const isOutflow = tx.amount < 0;
  const icon = iconFor(tx.type);
  const statusPill = pillForStatus(tx.status);

  return (
    <li className="w-full bg-[#0f1424] rounded-xl px-3 py-3 sm:px-4 sm:py-3 flex items-center gap-3 border border-blue-900/20">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
        ${tx.type === "deposit" ? "bg-green-500/15 text-green-300" :
          tx.type === "withdraw" ? "bg-red-500/15 text-red-300" :
          "bg-blue-500/15 text-blue-300"}`}>
        {icon}
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white font-semibold truncate">{tx.title}</p>
          {statusPill}
        </div>
        <p className="text-gray-400 text-xs truncate">{tx.note ?? timeAgo(tx.timestamp)}</p>
      </div>

      {/* Amount */}
      <div className={`text-right font-bold ${isOutflow ? "text-red-400" : "text-green-400"}`}>
        {isOutflow ? "-" : "+"}
        {formatMoney(Math.abs(tx.amount), tx.currency || "USD")}
      </div>
    </li>
  );
}

/* ---------- Small helpers ---------- */

function iconFor(type) {
  const common = "text-xl";
  if (type === "deposit") return <FiDownload className={common} />;
  if (type === "withdraw") return <FiUpload className={common} />;
  return <FiArrowRight className={common} />; // transfer default
}

function pillForStatus(status = "success") {
  const base =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold";
  if (status === "pending")
    return (
      <span className={`${base} bg-yellow-500/15 text-yellow-300`}>
        <FiClock className="text-xs" /> Pending
      </span>
    );
  if (status === "failed")
    return (
      <span className={`${base} bg-red-500/15 text-red-300`}>
        <FiXCircle className="text-xs" /> Failed
      </span>
    );
  return (
    <span className={`${base} bg-green-500/15 text-green-300`}>
      <FiCheckCircle className="text-xs" /> Successful
    </span>
  );
}

function formatMoney(n, currency = "USD") {
  try {
    return n.toLocaleString(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    });
  } catch {
    return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
}

function timeAgo(ts) {
  const d = new Date(ts || Date.now());
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleString();
}

function dayKey(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}
function labelForDay(d) {
  const today = new Date();
  const y = new Date(Date.now() - 86400000);
  const same = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (same(d, today)) return "Today";
  if (same(d, y)) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/* ---------- Skeleton ---------- */

function SkeletonList() {
  return (
    <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-3">
      <div className="h-3 w-24 bg-white/5 rounded" />
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-[#0f1424] border border-blue-900/20 rounded-xl px-3 py-3 sm:px-4 sm:py-3 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 bg-white/5 rounded" />
            <div className="h-3 w-28 bg-white/5 rounded" />
          </div>
          <div className="h-4 w-24 bg-white/5 rounded" />
        </div>
      ))}
    </div>
  );
}
