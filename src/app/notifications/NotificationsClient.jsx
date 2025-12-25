"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft, FiBell, FiTrendingUp, FiCheckCircle, FiInfo, FiMail, FiTrash2,
} from "react-icons/fi";
import { TbMailOpened } from "react-icons/tb";

/* ---- local prefs keys ---- */
const LS_LANG = "staqk_lang";
const LS_FIAT = "staqk_fiat";

/* ---- i18n ---- */
const I18N = {
  en: {
    title: "Notifications",
    markAll: "Mark all read",
    clear: "Clear",
    empty: "No notifications yet",
    new: "new",
    justNow: "just now",
    minAgo: (m) => `${m}m ago`,
    hrAgo: (h) => `${h}h ago`,
    deposit: "Deposit",
    withdrawal: "Withdrawal",
    transfer: "Transfer",
    pending: "pending",
    failed: "failed",
    success: "successful",
    crossedUp: "crossed ↑",
    crossedDown: "crossed ↓",
    current: "Current",
    source: "Source",
    securityTipTitle: "Security tip: Enable 2FA",
    securityTipBody: "Protect your account with an authenticator app or SMS.",
  },
  fr: {
    title: "Notifications",
    markAll: "Tout marquer comme lu",
    clear: "Effacer",
    empty: "Aucune notification",
    new: "nouv.",
    justNow: "à l’instant",
    minAgo: (m) => `il y a ${m} min`,
    hrAgo: (h) => `il y a ${h} h`,
    deposit: "Dépôt",
    withdrawal: "Retrait",
    transfer: "Transfert",
    pending: "en attente",
    failed: "échoué",
    success: "réussi",
    crossedUp: "a franchi ↑",
    crossedDown: "a franchi ↓",
    current: "Actuel",
    source: "Source",
    securityTipTitle: "Conseil sécurité : activez la 2FA",
    securityTipBody: "Protégez votre compte avec une appli d’authentification ou SMS.",
  },
  es: {
    title: "Notificaciones",
    markAll: "Marcar todo como leído",
    clear: "Borrar",
    empty: "Sin notificaciones",
    new: "nuevas",
    justNow: "ahora",
    minAgo: (m) => `hace ${m} min`,
    hrAgo: (h) => `hace ${h} h`,
    deposit: "Depósito",
    withdrawal: "Retiro",
    transfer: "Transferencia",
    pending: "pendiente",
    failed: "fallida",
    success: "exitosa",
    crossedUp: "cruzó ↑",
    crossedDown: "cruzó ↓",
    current: "Actual",
    source: "Fuente",
    securityTipTitle: "Tip de seguridad: activa 2FA",
    securityTipBody: "Protege tu cuenta con una app autenticadora o SMS.",
  },
  de: {
    title: "Benachrichtigungen",
    markAll: "Alle als gelesen markieren",
    clear: "Leeren",
    empty: "Keine Benachrichtigungen",
    new: "neu",
    justNow: "gerade eben",
    minAgo: (m) => `vor ${m} Min.`,
    hrAgo: (h) => `vor ${h} Std.`,
    deposit: "Einzahlung",
    withdrawal: "Abhebung",
    transfer: "Überweisung",
    pending: "ausstehend",
    failed: "fehlgeschlagen",
    success: "erfolgreich",
    crossedUp: "überschritt ↑",
    crossedDown: "unterschritt ↓",
    current: "Aktuell",
    source: "Quelle",
    securityTipTitle: "Sicherheitstipp: 2FA aktivieren",
    securityTipBody: "Schütze dein Konto mit Authenticator-App oder SMS.",
  },
  ar: {
    title: "الإشعارات",
    markAll: "وضع الكل كمقروء",
    clear: "مسح",
    empty: "لا توجد إشعارات",
    new: "جديد",
    justNow: "الآن",
    minAgo: (m) => `قبل ${m} دقيقة`,
    hrAgo: (h) => `قبل ${h} ساعة`,
    deposit: "إيداع",
    withdrawal: "سحب",
    transfer: "تحويل",
    pending: "قيد الانتظار",
    failed: "فشل",
    success: "ناجح",
    crossedUp: "تجاوز ↑",
    crossedDown: "انخفض ↓",
    current: "الحالي",
    source: "المصدر",
    securityTipTitle: "نصيحة أمنية: فعّل 2FA",
    securityTipBody: "احمِ حسابك بتطبيق مصادقة أو SMS.",
  },
  zh: {
    title: "通知",
    markAll: "全部标为已读",
    clear: "清空",
    empty: "暂无通知",
    new: "条新",
    justNow: "刚刚",
    minAgo: (m) => `${m} 分钟前`,
    hrAgo: (h) => `${h} 小时前`,
    deposit: "充值",
    withdrawal: "提现",
    transfer: "转账",
    pending: "处理中",
    failed: "失败",
    success: "成功",
    crossedUp: "突破 ↑",
    crossedDown: "跌破 ↓",
    current: "当前",
    source: "来源",
    securityTipTitle: "安全提示：开启 2FA",
    securityTipBody: "使用验证器应用或短信保护账户。",
  },
};

function pickLang(v) {
  const k = String(v || "en").toLowerCase();
  return I18N[k] ? k : "en";
}
function localeFor(lang) {
  const l = pickLang(lang);
  if (l === "fr") return "fr-FR";
  if (l === "es") return "es-ES";
  if (l === "de") return "de-DE";
  if (l === "ar") return "ar";
  if (l === "zh") return "zh-CN";
  return "en-US";
}

function formatMoney(n, currency = "USD", locale) {
  try {
    return Number(n || 0).toLocaleString(locale || undefined, {
      style: "currency",
      currency: String(currency || "USD").toUpperCase(),
      maximumFractionDigits: 2,
    });
  } catch {
    return `$${Number(n || 0).toFixed(2)}`;
  }
}

/**
 * Props:
 *  - initialTx: Tx[] from server (scoped to the logged-in user)
 */
export default function NotificationsClient({ initialTx = [] }) {
  const router = useRouter();

  // preferences (from localStorage; updated by hamburger menu)
  const [lang, setLang] = useState("en");
  const [fiat, setFiat] = useState("USD");
  const locale = useMemo(() => localeFor(lang), [lang]);
  const T = I18N[pickLang(lang)];

  useEffect(() => {
    const l = pickLang(typeof window !== "undefined" ? localStorage.getItem(LS_LANG) : "en");
    const f = (typeof window !== "undefined" ? localStorage.getItem(LS_FIAT) : "USD") || "USD";
    setLang(l);
    setFiat(String(f).toUpperCase());
  }, []);

  // ui state
  const [items, setItems] = useState([]);        // all notifications (tx + price + system)
  const [filter, setFilter] = useState("all");   // all | price | tx | system
  const [loading, setLoading] = useState(true);

  // de-dupe guards
  const fired = useRef(new Set());               // "fired once" keys
  const seenTx = useRef(new Set());              // tx ids already converted to notifications

  // ✅ NEW: previous prices to detect real crossings (prevents "crossed 70k" on first load)
  const lastPrices = useRef({}); // key -> last numeric price

  // derive
  const filtered = useMemo(() => {
    const arr = filter === "all" ? items : items.filter((n) => n.type === filter);
    return [...arr].sort((a, b) => b.ts - a.ts);
  }, [items, filter]);

  const unreadCount = items.filter((n) => !n.read).length;

  /* A) Seed TX notifications from server data */
  useEffect(() => {
    const fresh = [];

    for (const t of initialTx) {
      if (!t?.id || seenTx.current.has(t.id)) continue;
      seenTx.current.add(t.id);

      const isOutflow = Number(t.amount) < 0;

      const type = String(t.type || "TRANSFER").toUpperCase();
      const label =
        type === "DEPOSIT" ? T.deposit
        : type === "WITHDRAW" ? T.withdrawal
        : T.transfer;

      const statusRaw = String(t.status || "SUCCESS").toLowerCase();
      const statusLabel =
        statusRaw === "pending" ? T.pending
        : statusRaw === "failed" ? T.failed
        : T.success;

      const bits = [];
      if (t.title) bits.push(t.title);
      if (t.from && t.to) bits.push(`${t.from} → ${t.to}`);

      // ✅ currency changer: display TX using selected fiat (fiat)
      bits.push(`${isOutflow ? "-" : "+"}${formatMoney(Math.abs(Number(t.amount) || 0), fiat, locale)}`);

      const body = bits.join(" · ");

      fresh.push({
        id: `tx:${t.id}`,
        type: "tx",
        title: `${label} (${statusLabel})`,
        body,
        ts: t.createdAt ? Date.parse(t.createdAt) : Date.now(),
        read: false,
        meta: { tx: t },
      });
    }

    setItems((prev) => [...fresh, ...prev].sort((a, b) => b.ts - a.ts));
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTx, fiat, locale, lang]);

  /* B) Price alerts poller (with REAL crossing detection) */
  useEffect(() => {
    let mounted = true;

    const ALERT_RULES = {
      crypto: [
        { id: "bitcoin",  symbol: "BTC", above: 70000, below: null },
        { id: "ethereum", symbol: "ETH", above: 4000,  below: null },
      ],
      stocks: [
        { symbol: "AAPL", above: 200, below: null },
        { symbol: "TSLA", above: 300, below: null },
      ],
    };

    async function fetchCryptoPrices(rules) {
      if (!rules.length) return {};
      const ids = [...new Set(rules.map((r) => r.id))].join(",");
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("coin prices");
      return res.json();
    }

    async function fetchStockPrices(rules) {
      if (!rules.length) return {};
      const symbols = [...new Set(rules.map((r) => r.symbol.toLowerCase()))].join(",");
      const url = `https://stooq.com/q/l/?s=${symbols}&f=sd2t2ohlcv&h&e=csv`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("stock prices");
      const text = await res.text();
      const lines = text.trim().split(/\r?\n/);
      const out = {};
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        const sym = (cols[0] || "").toUpperCase();
        const close = Number(cols[6] || 0);
        if (!Number.isNaN(close)) out[sym] = close;
      }
      return out;
    }

    function shouldFireCrossAbove(key, prev, now, threshold) {
      if (prev == null) return false;              // first sample: don't fire
      return prev < threshold && now >= threshold; // true crossing
    }
    function shouldFireCrossBelow(key, prev, now, threshold) {
      if (prev == null) return false;
      return prev > threshold && now <= threshold;
    }

    async function tick() {
      try {
        const cryptoRules = ALERT_RULES.crypto || [];
        const stockRules = ALERT_RULES.stocks || [];

        const [crypto, stocks] = await Promise.all([
          fetchCryptoPrices(cryptoRules).catch(() => ({})),
          fetchStockPrices(stockRules).catch(() => ({})),
        ]);

        const nowTs = Date.now();
        const newNotifs = [];

        // --- crypto rules (USD source) ---
        for (const r of cryptoRules) {
          const px = crypto?.[r.id]?.usd;
          if (typeof px !== "number") continue;

          const keyBase = `cg:${r.id}`;
          const prev = lastPrices.current[keyBase];
          lastPrices.current[keyBase] = px;

          if (r.above != null) {
            const th = Number(r.above);
            const fireKey = `${keyBase}:above:${th}`;

            if (shouldFireCrossAbove(keyBase, prev, px, th) && !fired.current.has(fireKey)) {
              fired.current.add(fireKey);
              newNotifs.push({
                id: `${fireKey}:${nowTs}`,
                type: "price",
                // keep USD here because the API is USD (no FX conversion)
                title: `${r.symbol} ${T.crossedUp} ${formatMoney(th, "USD", locale)}`,
                body: `${T.current} ${r.symbol}: ${formatMoney(px, "USD", locale)} · ${T.source}: CoinGecko`,
                ts: nowTs,
                read: false,
              });
            }
          }

          if (r.below != null) {
            const th = Number(r.below);
            const fireKey = `${keyBase}:below:${th}`;

            if (shouldFireCrossBelow(keyBase, prev, px, th) && !fired.current.has(fireKey)) {
              fired.current.add(fireKey);
              newNotifs.push({
                id: `${fireKey}:${nowTs}`,
                type: "price",
                title: `${r.symbol} ${T.crossedDown} ${formatMoney(th, "USD", locale)}`,
                body: `${T.current} ${r.symbol}: ${formatMoney(px, "USD", locale)} · ${T.source}: CoinGecko`,
                ts: nowTs,
                read: false,
              });
            }
          }
        }

        // --- stock rules (USD source) ---
        for (const r of stockRules) {
          const sym = (r.symbol || "").toUpperCase();
          const px = stocks?.[sym];
          if (typeof px !== "number") continue;

          const keyBase = `stq:${sym}`;
          const prev = lastPrices.current[keyBase];
          lastPrices.current[keyBase] = px;

          if (r.above != null) {
            const th = Number(r.above);
            const fireKey = `${keyBase}:above:${th}`;

            if (shouldFireCrossAbove(keyBase, prev, px, th) && !fired.current.has(fireKey)) {
              fired.current.add(fireKey);
              newNotifs.push({
                id: `${fireKey}:${nowTs}`,
                type: "price",
                title: `${sym} ${T.crossedUp} ${formatMoney(th, "USD", locale)}`,
                body: `${T.current} ${sym}: ${formatMoney(px, "USD", locale)} · ${T.source}: Stooq`,
                ts: nowTs,
                read: false,
              });
            }
          }

          if (r.below != null) {
            const th = Number(r.below);
            const fireKey = `${keyBase}:below:${th}`;

            if (shouldFireCrossBelow(keyBase, prev, px, th) && !fired.current.has(fireKey)) {
              fired.current.add(fireKey);
              newNotifs.push({
                id: `${fireKey}:${nowTs}`,
                type: "price",
                title: `${sym} ${T.crossedDown} ${formatMoney(th, "USD", locale)}`,
                body: `${T.current} ${sym}: ${formatMoney(px, "USD", locale)} · ${T.source}: Stooq`,
                ts: nowTs,
                read: false,
              });
            }
          }
        }

        if (mounted && newNotifs.length) {
          setItems((prev) => [...newNotifs, ...prev].sort((a, b) => b.ts - a.ts));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    tick();
    const id = setInterval(tick, 60_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [locale, lang, T]);

  /* C) One-time system tip */
  useEffect(() => {
    setItems((prev) =>
      prev.some((n) => n.id === "sys:2fa")
        ? prev
        : [
            {
              id: "sys:2fa",
              type: "system",
              title: T.securityTipTitle,
              body: T.securityTipBody,
              ts: Date.now() - 1000 * 60 * 90,
              read: true,
            },
            ...prev,
          ]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // helpers
  function markAllRead() {
    setItems((p) => p.map((n) => ({ ...n, read: true })));
  }
  function clearAll() {
    setItems([]);
  }
  function toggleRead(id) {
    setItems((p) => p.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  }
  function removeOne(id) {
    setItems((p) => p.filter((n) => n.id !== id));
  }

  function timeAgo(ts) {
    const d = new Date(ts || Date.now());
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return T.justNow;
    if (s < 3600) return T.minAgo(Math.floor(s / 60));
    if (s < 86400) return T.hrAgo(Math.floor(s / 3600));
    return d.toLocaleString(locale);
  }

  return (
    <main className="min-h-[100dvh] bg-[#10141c]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#10141c]/95 backdrop-blur border-b border-gray-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-gray-300 hover:text-white"
              aria-label="Back"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>

            <h1 className="text-white text-lg font-bold">{T.title}</h1>

            {unreadCount > 0 && (
              <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                {unreadCount} {T.new}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={markAllRead}
              className="text-xs font-semibold text-blue-300 hover:text-blue-200"
            >
              {T.markAll}
            </button>
            <button
              onClick={clearAll}
              className="text-xs font-semibold text-red-300 hover:text-red-200"
              title="Clear all"
            >
              {T.clear}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-2xl mx-auto p-3 sm:p-4">
        {loading ? (
          <Skeleton />
        ) : filtered.length === 0 ? (
          <EmptyState emptyText={T.empty} />
        ) : (
          <ul className="space-y-3">
            {filtered.map((n) => (
              <li
                key={n.id}
                className="bg-[#0f1424] border border-blue-900/30 rounded-xl px-3 py-3 sm:px-4 sm:py-4"
              >
                <div className="flex items-start gap-3">
                  <IconBadge type={n.type} read={n.read} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold truncate">{n.title}</p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mt-0.5">{n.body}</p>
                    <div className="text-xs text-gray-500 mt-2">{timeAgo(n.ts)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => toggleRead(n.id)}
                      className="text-gray-300 hover:text-white"
                      title={n.read ? "Mark as unread" : "Mark as read"}
                    >
                      {n.read ? (
                        <TbMailOpened className="h-5 w-5" />
                      ) : (
                        <FiMail className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => removeOne(n.id)}
                      className="text-gray-300 hover:text-red-300"
                      title="Delete"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

/* --- Small pieces --- */
function IconBadge({ type, read }) {
  const base = "w-10 h-10 rounded-full flex items-center justify-center shrink-0";
  if (type === "price")
    return (
      <div className={`${base} ${read ? "bg-blue-500/10" : "bg-blue-500/20"} text-blue-300`}>
        <FiTrendingUp />
      </div>
    );
  if (type === "tx")
    return (
      <div className={`${base} ${read ? "bg-green-500/10" : "bg-green-500/20"} text-green-300`}>
        <FiCheckCircle />
      </div>
    );
  return (
    <div className={`${base} ${read ? "bg-yellow-500/10" : "bg-yellow-500/20"} text-yellow-300`}>
      <FiInfo />
    </div>
  );
}

function EmptyState({ emptyText }) {
  return (
    <div className="bg-[#0f1424] border border-blue-900/30 rounded-xl p-8 text-center text-gray-400">
      <FiBell className="mx-auto mb-3 h-8 w-8 text-gray-500" />
      {emptyText || "No notifications yet"}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-[#0f1424] border border-blue-900/30 rounded-xl px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-white/5 rounded" />
              <div className="h-3 w-1/2 bg-white/5 rounded" />
              <div className="h-3 w-1/3 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
