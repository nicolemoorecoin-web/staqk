// src/app/components/RecentTransactions.js

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import prisma from "../../lib/prisma";
import {
  FiDownload,
  FiUpload,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";
import { FaArrowsLeftRight, FaHandHoldingDollar } from "react-icons/fa6"; // ✅ swap + investment/withdraw icon

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/* ---------------- i18n ---------------- */

const L10N = {
  en: {
    title: "Recent Transactions",
    viewAll: "View all",
    empty: "No transactions yet",
    pending: "Pending",
    failed: "Failed",
    success: "Successful",
    deposit: "Deposit",
    withdrawal: "Withdrawal",
    transfer: "Transfer",
    swap: "Swap",
    investment: "Investment",
  },
  fr: {
    title: "Transactions récentes",
    viewAll: "Voir tout",
    empty: "Aucune transaction",
    pending: "En attente",
    failed: "Échoué",
    success: "Réussi",
    deposit: "Dépôt",
    withdrawal: "Retrait",
    transfer: "Transfert",
    swap: "Swap",
    investment: "Investissement",
  },
  es: {
    title: "Transacciones recientes",
    viewAll: "Ver todo",
    empty: "Sin transacciones",
    pending: "Pendiente",
    failed: "Fallida",
    success: "Exitosa",
    deposit: "Depósito",
    withdrawal: "Retiro",
    transfer: "Transferencia",
    swap: "Swap",
    investment: "Inversión",
  },
  de: {
    title: "Letzte Transaktionen",
    viewAll: "Alle anzeigen",
    empty: "Noch keine Transaktionen",
    pending: "Ausstehend",
    failed: "Fehlgeschlagen",
    success: "Erfolgreich",
    deposit: "Einzahlung",
    withdrawal: "Abhebung",
    transfer: "Überweisung",
    swap: "Swap",
    investment: "Investition",
  },
  ar: {
    title: "المعاملات الأخيرة",
    viewAll: "عرض الكل",
    empty: "لا توجد معاملات",
    pending: "قيد الانتظار",
    failed: "فشل",
    success: "ناجحة",
    deposit: "إيداع",
    withdrawal: "سحب",
    transfer: "تحويل",
    swap: "مبادلة",
    investment: "استثمار",
  },
  zh: {
    title: "最近交易",
    viewAll: "查看全部",
    empty: "暂无交易",
    pending: "处理中",
    failed: "失败",
    success: "成功",
    deposit: "充值",
    withdrawal: "提现",
    transfer: "转账",
    swap: "兑换",
    investment: "投资",
  },
};

function pickLang(code) {
  const k = String(code || "en").toLowerCase();
  return L10N[k] ? k : "en";
}

function langToLocale(lang) {
  if (lang === "fr") return "fr-FR";
  if (lang === "es") return "es-ES";
  if (lang === "de") return "de-DE";
  if (lang === "ar") return "ar";
  if (lang === "zh") return "zh-CN";
  return "en-US";
}

/* ---------------- amount helpers ---------------- */

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

function pickAmountFromTx(tx) {
  const meta = tx?.meta && typeof tx.meta === "object" ? tx.meta : null;

  const candidates = [
    tx?.amount,
    tx?.amountUsd,
    tx?.amount_usd,
    tx?.usdAmount,
    tx?.usd,
    tx?.value,
    tx?.delta,
    tx?.change,
    tx?.netAmount,

    meta?.amount,
    meta?.amountUsd,
    meta?.amount_usd,
    meta?.usd,
    meta?.value,
    meta?.delta,
  ];

  // pass 1: non-zero
  for (const c of candidates) {
    const n = toNumberLoose(c);
    if (n !== null && n !== 0) return n;
  }
  // pass 2: allow 0
  for (const c of candidates) {
    const n = toNumberLoose(c);
    if (n !== null) return n;
  }
  return 0;
}

/* ---------------- classification ---------------- */

// ✅ TRUE swaps only (not investments)
function isRealSwapTx(tx) {
  const title = String(tx?.title || "").trim().toLowerCase();
  if (title.startsWith("swap")) return true;
  if (title.includes("swap -") || title.includes("swap —")) return true;

  const meta = tx?.meta;
  if (meta && typeof meta === "object") {
    const k = String(meta.kind || meta.action || "").toUpperCase();
    if (k.includes("SWAP")) return true;
  }
  return false;
}

function metaKind(tx) {
  const meta = tx?.meta;
  if (!meta || typeof meta !== "object") return "";
  return String(meta.kind || meta.action || "").toUpperCase();
}

// UI kind is ONLY for icon/colors/label
function uiKindForTx(tx) {
  const type = String(tx?.type || "TRANSFER").toUpperCase();
  const k = metaKind(tx);

  // ✅ Investment start/topup should NOT be swap
  if (k === "INVEST_START" || k === "INVEST_TOPUP") return "INVEST";

  // ✅ Investment withdraw should look like withdrawal (hand-money icon)
  if (k === "INVEST_WITHDRAW" || k === "INVEST_WITHDRAW_ALL") return "PAYOUT";

  // ✅ Real swaps
  if (type === "TRANSFER" && isRealSwapTx(tx)) return "SWAP";

  return type; // DEPOSIT/WITHDRAW/TRANSFER
}

function formatMoney(n, currency, locale) {
  const amt = Number(n || 0);
  try {
    return amt.toLocaleString(locale || undefined, {
      style: "currency",
      currency: String(currency || "USD").toUpperCase(),
      maximumFractionDigits: 2,
    });
  } catch {
    return `$${amt.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
}

/* ---------------- component ---------------- */

export default async function RecentTransactions({ limit = 3 }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <section className="mx-4">
        <Header lang="en" />
        <Empty lang="en" />
      </section>
    );
  }

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, language: true, fiatCurrency: true },
  });

  const lang = pickLang(me?.language);
  const locale = langToLocale(lang);
  const currency = String(me?.fiatCurrency || "USD").toUpperCase();

  const userId = me?.id || session?.user?.id;
  if (!userId) {
    return (
      <section className="mx-4">
        <Header lang={lang} />
        <Empty lang={lang} />
      </section>
    );
  }

  const items = await prisma.tx.findMany({
    where: { wallet: { userId } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: Number(limit) || 3,
  });

  return (
    <section className="mx-4">
      <Header lang={lang} />
      {items.length === 0 ? (
        <Empty lang={lang} />
      ) : (
        <ul className="space-y-2">
          {items.map((t) => (
            <Row key={t.id} tx={t} lang={lang} locale={locale} currency={currency} />
          ))}
        </ul>
      )}
    </section>
  );
}

function Header({ lang }) {
  const T = L10N[pickLang(lang)];
  return (
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-white font-semibold">{T.title}</h2>
      <Link href="/transactions" className="text-blue-300 text-sm font-semibold hover:text-blue-200">
        {T.viewAll}
      </Link>
    </div>
  );
}

function Row({ tx, lang, locale, currency }) {
  const T = L10N[pickLang(lang)];

  const uiKind = uiKindForTx(tx); // DEPOSIT/WITHDRAW/TRANSFER/SWAP/INVEST/PAYOUT
  const rawAmount = pickAmountFromTx(tx);

  // Outflow logic:
  // - deposits are inflow (+)
  // - classic withdrawals are outflow (-)
  // - investment withdrawals may be stored as + (inflow to cash), so we treat PAYOUT as inflow
  const type = String(tx?.type || "TRANSFER").toUpperCase();
  const isClassicWithdraw = type === "WITHDRAW" && uiKind !== "PAYOUT";
  const isOut = rawAmount < 0 || (rawAmount === 0 && isClassicWithdraw);

  const amountAbs = Math.abs(rawAmount);

  const title =
    tx.title ||
    (uiKind === "DEPOSIT"
      ? T.deposit
      : uiKind === "WITHDRAW" || uiKind === "PAYOUT"
      ? T.withdrawal
      : uiKind === "INVEST"
      ? T.investment
      : uiKind === "SWAP"
      ? T.swap
      : T.transfer);

  const badgeClass =
    uiKind === "DEPOSIT"
      ? "bg-green-500/15 text-green-300"
      : uiKind === "WITHDRAW"
      ? "bg-red-500/15 text-red-300"
      : uiKind === "PAYOUT"
      ? "bg-emerald-500/15 text-emerald-300"
      : uiKind === "INVEST"
      ? "bg-sky-500/15 text-sky-300"
      : uiKind === "SWAP"
      ? "bg-purple-500/15 text-purple-300"
      : "bg-blue-500/15 text-blue-300";

  const icon =
    uiKind === "DEPOSIT" ? (
      <FiDownload />
    ) : uiKind === "WITHDRAW" ? (
      <FiUpload />
    ) : uiKind === "INVEST" ? (
      <FaHandHoldingDollar />
    ) : uiKind === "PAYOUT" ? (
      <FaHandHoldingDollar />
    ) : uiKind === "SWAP" ? (
      <FaArrowsLeftRight />
    ) : (
      <FiArrowRight />
    );

  return (
    <li className="bg-[#141a29] rounded-xl px-4 py-3 border border-blue-900/20 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${badgeClass}`}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white font-semibold truncate">{title}</p>
          {pill(tx.status, lang)}
        </div>
        <p className="text-gray-400 text-xs truncate">
          {new Date(tx.createdAt).toLocaleString(locale)}
        </p>
      </div>

      <div className={`font-bold ${isOut ? "text-red-400" : "text-green-400"}`}>
        {isOut ? "-" : "+"}
        {formatMoney(amountAbs, currency, locale)}
      </div>
    </li>
  );
}

function pill(status = "SUCCESS", lang = "en") {
  const T = L10N[pickLang(lang)];
  const s = String(status || "success").toLowerCase();
  const base = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold";
  if (s === "pending")
    return (
      <span className={`${base} bg-yellow-500/15 text-yellow-300`}>
        <FiClock className="text-xs" /> {T.pending}
      </span>
    );
  if (s === "failed")
    return (
      <span className={`${base} bg-red-500/15 text-red-300`}>
        <FiXCircle className="text-xs" /> {T.failed}
      </span>
    );
  return (
    <span className={`${base} bg-green-500/15 text-green-300`}>
      <FiCheckCircle className="text-xs" /> {T.success}
    </span>
  );
}

function Empty({ lang }) {
  const T = L10N[pickLang(lang)];
  return (
    <div className="bg-[#141a29] rounded-xl px-4 py-5 border border-blue-900/20 text-sm text-gray-400">
      {T.empty}
    </div>
  );
}
