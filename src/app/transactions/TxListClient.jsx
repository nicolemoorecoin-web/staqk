// src/app/transactions/TxListClient.jsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppPrefs } from "../components/AppPrefsProvider";
import {
  FiArrowLeft,
  FiSearch,
  FiFilter,
  FiDownload,
  FiUpload,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";
import { FaArrowsLeftRight, FaHandHoldingDollar } from "react-icons/fa6";

const TXT = {
  en: {
    title: "All Transactions",
    searchPh: "Search id, title…",
    allTypes: "All types",
    deposits: "Deposits",
    withdrawals: "Withdrawals",
    transfers: "Transfers",
    anyStatus: "Any status",
    successful: "Successful",
    pending: "Pending",
    failed: "Failed",
    back: "← Back to Dashboard",
    emptyTitle: "No transactions yet",
    emptyDesc: "Deposits, withdrawals and transfers will show up here.",
    goDash: "Go to Dashboard",
    today: "Today",
    yesterday: "Yesterday",
    deposit: "Deposit",
    withdrawal: "Withdrawal",
    transfer: "Transfer",
    investment: "Investment",
  },
  fr: {
    title: "Toutes les transactions",
    searchPh: "Rechercher id, titre…",
    allTypes: "Tous les types",
    deposits: "Dépôts",
    withdrawals: "Retraits",
    transfers: "Transferts",
    anyStatus: "Tous statuts",
    successful: "Réussi",
    pending: "En attente",
    failed: "Échoué",
    back: "← Retour au tableau de bord",
    emptyTitle: "Aucune transaction",
    emptyDesc: "Les dépôts, retraits et transferts apparaîtront ici.",
    goDash: "Aller au tableau de bord",
    today: "Aujourd’hui",
    yesterday: "Hier",
    deposit: "Dépôt",
    withdrawal: "Retrait",
    transfer: "Transfert",
    investment: "Investissement",
  },
  es: {
    title: "Todas las transacciones",
    searchPh: "Buscar id, título…",
    allTypes: "Todos los tipos",
    deposits: "Depósitos",
    withdrawals: "Retiros",
    transfers: "Transferencias",
    anyStatus: "Cualquier estado",
    successful: "Exitosa",
    pending: "Pendiente",
    failed: "Fallida",
    back: "← Volver al panel",
    emptyTitle: "Sin transacciones",
    emptyDesc: "Los depósitos, retiros y transferencias aparecerán aquí.",
    goDash: "Ir al panel",
    today: "Hoy",
    yesterday: "Ayer",
    deposit: "Depósito",
    withdrawal: "Retiro",
    transfer: "Transferencia",
    investment: "Inversión",
  },
  de: {
    title: "Alle Transaktionen",
    searchPh: "Suche id, Titel…",
    allTypes: "Alle Typen",
    deposits: "Einzahlungen",
    withdrawals: "Auszahlungen",
    transfers: "Überweisungen",
    anyStatus: "Jeder Status",
    successful: "Erfolgreich",
    pending: "Ausstehend",
    failed: "Fehlgeschlagen",
    back: "← Zurück zum Dashboard",
    emptyTitle: "Noch keine Transaktionen",
    emptyDesc: "Einzahlungen, Auszahlungen und Transfers erscheinen hier.",
    goDash: "Zum Dashboard",
    today: "Heute",
    yesterday: "Gestern",
    deposit: "Einzahlung",
    withdrawal: "Auszahlung",
    transfer: "Überweisung",
    investment: "Investition",
  },
  ar: {
    title: "كل المعاملات",
    searchPh: "ابحث بالمعرّف أو العنوان…",
    allTypes: "كل الأنواع",
    deposits: "إيداعات",
    withdrawals: "سحوبات",
    transfers: "تحويلات",
    anyStatus: "أي حالة",
    successful: "ناجحة",
    pending: "قيد الانتظار",
    failed: "فاشلة",
    back: "← الرجوع للوحة التحكم",
    emptyTitle: "لا توجد معاملات",
    emptyDesc: "ستظهر الإيداعات والسحوبات والتحويلات هنا.",
    goDash: "اذهب للوحة التحكم",
    today: "اليوم",
    yesterday: "أمس",
    deposit: "إيداع",
    withdrawal: "سحب",
    transfer: "تحويل",
    investment: "استثمار",
  },
  zh: {
    title: "全部交易",
    searchPh: "搜索 id、标题…",
    allTypes: "全部类型",
    deposits: "充值",
    withdrawals: "提现",
    transfers: "转账",
    anyStatus: "任意状态",
    successful: "成功",
    pending: "处理中",
    failed: "失败",
    back: "← 返回仪表盘",
    emptyTitle: "暂无交易",
    emptyDesc: "充值、提现和转账会显示在这里。",
    goDash: "前往仪表盘",
    today: "今天",
    yesterday: "昨天",
    deposit: "充值",
    withdrawal: "提现",
    transfer: "转账",
    investment: "投资",
  },
};

function pickLang(code) {
  const k = String(code || "en").toLowerCase();
  return TXT[k] ? k : "en";
}

/* ---------------- amount normalization ---------------- */

function toNumberLoose(v) {
  if (v === null || v === undefined) return null;

  if (typeof v === "number") return Number.isFinite(v) ? v : null;

  if (typeof v === "string") {
    const cleaned = v.replace(/[^0-9.-]/g, "");
    if (!cleaned) return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }

  if (typeof v === "object") {
    try {
      if (typeof v.toNumber === "function") {
        const n = v.toNumber();
        return Number.isFinite(n) ? n : null;
      }
      if (typeof v.toString === "function") {
        const n = Number(v.toString());
        return Number.isFinite(n) ? n : null;
      }
      const n = Number(String(v));
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  }

  return null;
}

function pickAmountFromRow(t) {
  const meta = t?.meta || t?.metadata;

  const candidates = [
    t?.amount,
    t?.amountUsd,
    t?.amount_usd,
    t?.usdAmount,
    t?.usd,
    t?.value,
    t?.delta,
    t?.change,
    t?.netAmount,
    t?.amountCents != null ? Number(t.amountCents) / 100 : null,
    t?.amount_cents != null ? Number(t.amount_cents) / 100 : null,

    // meta candidates (important for investment rows)
    meta && typeof meta === "object" ? meta.amount : null,
    meta && typeof meta === "object" ? meta.amountUsd : null,
    meta && typeof meta === "object" ? meta.amount_usd : null,
    meta && typeof meta === "object" ? meta.usd : null,
    meta && typeof meta === "object" ? meta.value : null,
    meta && typeof meta === "object" ? meta.delta : null,
  ];

  // prefer non-zero first
  for (const c of candidates) {
    const n = toNumberLoose(c);
    if (n !== null && n !== 0) return n;
  }
  for (const c of candidates) {
    const n = toNumberLoose(c);
    if (n !== null) return n;
  }
  return 0;
}

/* ---------------- UI kind classifier ---------------- */

function uiKindFromRow(t) {
  const meta = t?.meta;
  const kind = meta && typeof meta === "object" ? String(meta.kind || meta.action || "").toUpperCase() : "";

  // ✅ Investment actions (NOT swaps)
  if (kind === "INVEST_START" || kind === "INVEST_TOPUP") return "INVEST";
  if (kind === "INVEST_WITHDRAW" || kind === "INVEST_WITHDRAW_ALL") return "PAYOUT";

  // ✅ Real swaps only (legacy)
  const title = String(t?.title || "").trim().toLowerCase();
  if (title.startsWith("swap")) return "SWAP";
  if (kind.includes("SWAP")) return "SWAP";

  return null;
}

/** Normalize DB row -> UI shape */
function castTx(t, L) {
  const type = String(t?.type || "TRANSFER").toUpperCase();
  let amt = pickAmountFromRow(t);

  // normalize sign
  if (type === "WITHDRAW" && amt > 0) {
    // NOTE: your investment-withdraw rows intentionally store WITHDRAW +positive
    // to show +$ inflow but still filter under Withdrawals.
    // So we only force negative if it looks like a “real” withdrawal row (no INVEST_* meta).
    const meta = t?.meta;
    const kind = meta && typeof meta === "object" ? String(meta.kind || "").toUpperCase() : "";
    const isInvestWithdraw = kind === "INVEST_WITHDRAW" || kind === "INVEST_WITHDRAW_ALL";
    if (!isInvestWithdraw) amt = -amt;
  }
  if (type === "DEPOSIT" && amt < 0) amt = Math.abs(amt);

  const uiKind = uiKindFromRow(t) || type;

  // titles:
  // - investment rows already come with "Investment - ..."
  // - withdrawal from investments comes with "Withdrawal - ..."
  // so we keep t.title if present
  const title =
    t.title ||
    (type === "DEPOSIT"
      ? L.deposit
      : type === "WITHDRAW"
      ? L.withdrawal
      : L.transfer);

  return {
    id: t.id,
    type,
    uiKind,
    title,
    note: t.notes || "",
    amount: amt,
    currency: t.currency || "USD",
    status: String(t.status || "SUCCESS").toLowerCase(),
    ts: t.createdAt ? Date.parse(t.createdAt) : Date.now(),
  };
}

export default function TxListClient({ initialItems = [] }) {
  const router = useRouter();
  const { language, locale, formatMoney } = useAppPrefs();
  const L = useMemo(() => TXT[pickLang(language)], [language]);

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [query, setQuery] = useState("");

  const tx = useMemo(() => {
    const list = (initialItems || [])
      .map((t) => castTx(t, L))
      .sort((a, b) => (b.ts || 0) - (a.ts || 0));

    return list.filter((t) => {
      if (typeFilter !== "ALL" && t.type !== typeFilter) return false;
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;

      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = `${t.id} ${t.title} ${t.note} ${t.type} ${t.currency}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [initialItems, typeFilter, statusFilter, query, L]);

  const groups = useMemo(() => {
    const byDay = {};
    for (const it of tx) {
      const d = new Date(it.ts || Date.now());
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      (byDay[key] ||= []).push(it);
    }
    return Object.entries(byDay)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .map(([k, arr]) => ({ label: labelForDay(new Date(k), L, locale), items: arr }));
  }, [tx, L, locale]);

  return (
    <main className="min-h-[100dvh] bg-[#10141c]">
      <div className="sticky top-0 z-10 bg-[#10141c]/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-300 hover:text-white">
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-white text-lg font-bold">{L.title}</h1>
        <div className="ml-auto" />
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-5">
        <section className="bg-[#151a28] rounded-2xl border border-blue-900/30 p-3 sm:p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={L.searchPh}
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
                <option value="ALL">{L.allTypes}</option>
                <option value="DEPOSIT">{L.deposits}</option>
                <option value="WITHDRAW">{L.withdrawals}</option>
                <option value="TRANSFER">{L.transfers}</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0f1424] border border-blue-900/30 rounded-lg px-2.5 py-2 text-white"
              >
                <option value="ALL">{L.anyStatus}</option>
                <option value="success">{L.successful}</option>
                <option value="pending">{L.pending}</option>
                <option value="failed">{L.failed}</option>
              </select>
            </div>
          </div>
        </section>

        {tx.length === 0 ? (
          <EmptyState L={L} />
        ) : (
          <section className="bg-[#141a29] rounded-2xl border border-blue-900/30 overflow-hidden">
            {groups.map((g) => (
              <div key={g.label} className="px-3 sm:px-4 py-3 sm:py-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {g.label}
                </div>
                <ul className="flex flex-col gap-2">
                  {g.items.map((t) => (
                    <TransactionRow key={t.id} tx={t} L={L} locale={locale} formatMoney={formatMoney} />
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        <div className="text-center text-sm text-gray-400">
          <Link href="/home" className="text-blue-300 hover:text-blue-200 font-semibold">
            {L.back}
          </Link>
        </div>
      </div>
    </main>
  );
}

function TransactionRow({ tx, L, locale, formatMoney }) {
  const impliedOutflow = (tx.type || "").toUpperCase() === "WITHDRAW";
  const isOutflow = tx.amount < 0 || (tx.amount === 0 && impliedOutflow);

  const badgeClass =
    tx.uiKind === "DEPOSIT"
      ? "bg-green-500/15 text-green-300"
      : tx.uiKind === "WITHDRAW"
      ? "bg-red-500/15 text-red-300"
      : tx.uiKind === "SWAP"
      ? "bg-purple-500/15 text-purple-300"
      : tx.uiKind === "INVEST"
      ? "bg-sky-500/15 text-sky-300"
      : tx.uiKind === "PAYOUT"
      ? "bg-emerald-500/15 text-emerald-300"
      : "bg-blue-500/15 text-blue-300";

  return (
    <li className="w-full bg-[#0f1424] rounded-xl px-3 py-3 sm:px-4 sm:py-3 flex items-center gap-3 border border-blue-900/20">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${badgeClass}`}>
        {iconFor(tx.uiKind)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white font-semibold truncate">{tx.title}</p>
          {statusPill(tx.status, L)}
        </div>
        <p className="text-gray-400 text-xs truncate">
          {tx.note || new Date(tx.ts).toLocaleString(locale || undefined)}
        </p>
      </div>

      <div className={`text-right font-bold ${isOutflow ? "text-red-400" : "text-green-400"}`}>
        {isOutflow ? "-" : "+"}
        {formatMoney(Math.abs(tx.amount))}
      </div>
    </li>
  );
}

function iconFor(kind) {
  const t = String(kind || "TRANSFER").toUpperCase();
  const cls = "text-xl";

  if (t === "DEPOSIT") return <FiDownload className={cls} />;
  if (t === "WITHDRAW") return <FiUpload className={cls} />;
  if (t === "TRANSFER") return <FiArrowRight className={cls} />;

  // ✅ your requested icons
  if (t === "INVEST") return <FaHandHoldingDollar className={cls} />;
  if (t === "PAYOUT") return <FaHandHoldingDollar className={cls} />;

  // legacy swap
  if (t === "SWAP") return <FaArrowsLeftRight className={cls} />;

  return <FiArrowRight className={cls} />;
}

function statusPill(status = "success", L) {
  const s = String(status || "success").toLowerCase();
  const base = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold";
  if (s === "pending")
    return (
      <span className={`${base} bg-yellow-500/15 text-yellow-300`}>
        <FiClock className="text-xs" /> {L.pending}
      </span>
    );
  if (s === "failed")
    return (
      <span className={`${base} bg-red-500/15 text-red-300`}>
        <FiXCircle className="text-xs" /> {L.failed}
      </span>
    );
  return (
    <span className={`${base} bg-green-500/15 text-green-300`}>
      <FiCheckCircle className="text-xs" /> {L.successful}
    </span>
  );
}

function labelForDay(d, L, locale) {
  const today = new Date();
  const y = new Date(Date.now() - 86400000);

  const same = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (same(d, today)) return L.today;
  if (same(d, y)) return L.yesterday;

  return d.toLocaleDateString(locale || undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function EmptyState({ L }) {
  return (
    <div className="bg-[#151a28] rounded-2xl border border-blue-900/30 p-8 text-center">
      <div className="text-white font-semibold text-lg">{L.emptyTitle}</div>
      <p className="text-gray-400 text-sm mt-1">{L.emptyDesc}</p>
      <Link
        href="/home"
        className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
      >
        {L.goDash}
      </Link>
    </div>
  );
}
