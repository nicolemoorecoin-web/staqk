// src/app/transactions/page.js
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiSearch,
  FiFilter,
  FiDownload,   // deposit
  FiUpload,     // withdraw
  FiArrowRight, // transfer
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";

// adjust this path if your folder layout is different
import { useWalletStore } from "../../../lib/walletStore";

/** Map store tx → UI shape (keeps UI tolerant to small store changes) */
function castTx(t) {
  const type = (t.type || "TRANSFER").toUpperCase();
  return {
    id: t.id,
    type,                      // "DEPOSIT" | "WITHDRAW" | "TRANSFER"
    title:
      t.title ||
      (type === "DEPOSIT"
        ? `${(t.bucket || "Wallet").toUpperCase()} Deposit`
        : type === "WITHDRAW"
        ? `Withdrawal${t.bucket ? " — " + t.bucket : ""}`
        : t.to
        ? `Transfer ${t.from || ""} → ${t.to}`
        : "Transfer"),
    note: t.note || "",
    amount: Number(t.amount) || 0,     // deposits usually +, withdrawals/transfer −
    currency: t.currency || "USD",
    status: (t.status || "success").toLowerCase(), // success|pending|failed
    ts: t.ts || Date.now(),
  };
}

export default function TransactionsPage() {
  const router = useRouter();

  // read all transactions from the store
  const storeTx = useWalletStore((s) => s.tx) || [];

  // filters
  const [typeFilter, setTypeFilter] = useState("ALL");   // ALL|DEPOSIT|WITHDRAW|TRANSFER
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL|success|pending|failed
  const [query, setQuery] = useState("");

  // derive filtered + sorted list
  const tx = useMemo(() => {
    const list = storeTx.map(castTx).sort((a, b) => (b.ts || 0) - (a.ts || 0));

    return list.filter((t) => {
      if (typeFilter !== "ALL" && t.type !== typeFilter) return false;
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay =
          `${t.id} ${t.title} ${t.note} ${t.type} ${t.currency}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [storeTx, typeFilter, statusFilter, query]);

  // group by day (Today / Yesterday / date)
  const groups = useMemo(() => {
    const byDay = {};
    for (const it of tx) {
      const d = new Date(it.ts || Date.now());
      const k = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      (byDay[k] ||= []).push(it);
    }
    return Object.entries(byDay)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .map(([k, arr]) => ({ label: labelForDay(new Date(k)), items: arr }));
  }, [tx]);

  return (
    <main className="min-h-[100dvh] bg-[#10141c]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#10141c]/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-300 hover:text-white">
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-white text-lg font-bold">All Transactions</h1>
        <div className="ml-auto" />
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-5">
        {/* Filters */}
        <section className="bg-[#151a28] rounded-2xl border border-blue-900/30 p-3 sm:p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search id, title…"
                className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg pl-9 pr-3 py-2 text-white"
              />
            </div>

            <div className="inline-flex items-center gap-2">
              <FiFilter className="text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[#0f1424] border border-blue-900/30 rounded-lg px-2.5 py-2 text-white"
              >
                <option value="ALL">All types</option>
                <option value="DEPOSIT">Deposits</option>
                <option value="WITHDRAW">Withdrawals</option>
                <option value="TRANSFER">Transfers</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0f1424] border border-blue-900/30 rounded-lg px-2.5 py-2 text-white"
              >
                <option value="ALL">Any status</option>
                <option value="success">Successful</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </section>

        {/* List */}
        {tx.length === 0 ? (
          <EmptyState />
        ) : (
          <section className="bg-[#141a29] rounded-2xl border border-blue-900/30 overflow-hidden">
            {groups.map((g) => (
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
            ))}
          </section>
        )}

        {/* Link back to Dashboard */}
        <div className="text-center text-sm text-gray-400">
          <Link href="/home" className="text-blue-300 hover:text-blue-200 font-semibold">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ───────── row & helpers ───────── */

function TransactionRow({ tx }) {
  const isOutflow = tx.amount < 0;

  return (
    <li className="w-full bg-[#0f1424] rounded-xl px-3 py-3 sm:px-4 sm:py-3 flex items-center gap-3 border border-blue-900/20">
      {/* icon */}
      <div
        className={[
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          tx.type === "DEPOSIT"
            ? "bg-green-500/15 text-green-300"
            : tx.type === "WITHDRAW"
            ? "bg-red-500/15 text-red-300"
            : "bg-blue-500/15 text-blue-300",
        ].join(" ")}
      >
        {iconFor(tx.type)}
      </div>

      {/* main */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white font-semibold truncate">{tx.title}</p>
          {statusPill(tx.status)}
        </div>
        <p className="text-gray-400 text-xs truncate">
          {tx.note || new Date(tx.ts).toLocaleString()}
        </p>
      </div>

      {/* amount */}
      <div className={`text-right font-bold ${isOutflow ? "text-red-400" : "text-green-400"}`}>
        {isOutflow ? "-" : "+"}
        {formatMoney(Math.abs(tx.amount), tx.currency)}
      </div>
    </li>
  );
}

function iconFor(type) {
  const t = (type || "TRANSFER").toUpperCase();
  const cls = "text-xl";
  if (t === "DEPOSIT") return <FiDownload className={cls} />;
  if (t === "WITHDRAW") return <FiUpload className={cls} />;
  return <FiArrowRight className={cls} />;
}

function statusPill(status = "success") {
  const s = (status || "success").toLowerCase();
  const base = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold";
  if (s === "pending")
    return (
      <span className={`${base} bg-yellow-500/15 text-yellow-300`}>
        <FiClock className="text-xs" /> Pending
      </span>
    );
  if (s === "failed")
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

function EmptyState() {
  return (
    <div className="bg-[#151a28] rounded-2xl border border-blue-900/30 p-8 text-center">
      <div className="text-white font-semibold text-lg">No transactions yet</div>
      <p className="text-gray-400 text-sm mt-1">
        Deposits, withdrawals and transfers will show up here.
      </p>
      <Link
        href="/home"
        className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
