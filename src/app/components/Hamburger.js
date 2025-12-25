"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

/* ---- simple prefs keys ---- */
const LS_LANG = "staqk_lang";
const LS_FIAT = "staqk_fiat";

/* ---- supported options ---- */
const LANGS = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "de", label: "Deutsch", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "zh", label: "中文", dir: "ltr" },
];

const FIATS = ["USD", "EUR", "GBP", "CAD", "AUD", "NGN"];

/* ---- menu translations ---- */
const I18N = {
  en: {
    close: "Close",
    settings: "Settings",
    language: "Language",
    currency: "Currency",
    nav: {
      investments: "Investments",
      transactions: "Transactions",
      reports: "Reports",
      strategies: "Strategies",
      support: "Support",
      legal: "Legal",
    },
  },
  fr: {
    close: "Fermer",
    settings: "Paramètres",
    language: "Langue",
    currency: "Devise",
    nav: {
      investments: "Investissements",
      transactions: "Transactions",
      reports: "Rapports",
      strategies: "Stratégies",
      support: "Support",
      legal: "Légal",
    },
  },
  es: {
    close: "Cerrar",
    settings: "Ajustes",
    language: "Idioma",
    currency: "Moneda",
    nav: {
      investments: "Inversiones",
      transactions: "Transacciones",
      reports: "Informes",
      strategies: "Estrategias",
      support: "Soporte",
      legal: "Legal",
    },
  },
  de: {
    close: "Schließen",
    settings: "Einstellungen",
    language: "Sprache",
    currency: "Währung",
    nav: {
      investments: "Investitionen",
      transactions: "Transaktionen",
      reports: "Berichte",
      strategies: "Strategien",
      support: "Support",
      legal: "Rechtliches",
    },
  },
  ar: {
    close: "إغلاق",
    settings: "الإعدادات",
    language: "اللغة",
    currency: "العملة",
    nav: {
      investments: "الاستثمارات",
      transactions: "المعاملات",
      reports: "التقارير",
      strategies: "الاستراتيجيات",
      support: "الدعم",
      legal: "قانوني",
    },
  },
  zh: {
    close: "关闭",
    settings: "设置",
    language: "语言",
    currency: "货币",
    nav: {
      investments: "投资",
      transactions: "交易",
      reports: "报告",
      strategies: "策略",
      support: "支持",
      legal: "法律",
    },
  },
};

function pickLang(v) {
  const c = String(v || "en").toLowerCase();
  return I18N[c] ? c : "en";
}

async function savePrefsToServer(next) {
  // This route is included below as a drop-in.
  // If user is not logged in, it will just return 401 — we ignore it.
  try {
    await fetch("/api/me/prefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(next),
    });
  } catch {
    // ignore
  }
}

export default function HamburgerMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const [lang, setLang] = useState("en");
  const [fiat, setFiat] = useState("USD");

  useEffect(() => {
    const l = pickLang(typeof window !== "undefined" ? localStorage.getItem(LS_LANG) : "en");
    const f = (typeof window !== "undefined" ? localStorage.getItem(LS_FIAT) : "USD") || "USD";
    setLang(l);
    setFiat(String(f).toUpperCase());
  }, []);

  const T = I18N[pickLang(lang)];

  const links = useMemo(
    () => [
      { href: "/investments", key: "investments" },
      { href: "/transactions", key: "transactions" },
      { href: "/reports", key: "reports" },
      { href: "/strategies", key: "strategies" },
      { href: "/support", key: "support" },
      { href: "/legal", key: "legal" },
    ],
    []
  );

  async function applyLang(nextLang) {
    const l = pickLang(nextLang);
    const dir = LANGS.find((x) => x.code === l)?.dir || "ltr";

    setLang(l);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_LANG, l);
      document.documentElement.dir = dir;
      document.documentElement.lang = l;
    }

    await savePrefsToServer({ language: l });
    router.refresh();
  }

  async function applyFiat(nextFiat) {
    const f = String(nextFiat || "USD").toUpperCase();
    const safe = FIATS.includes(f) ? f : "USD";

    setFiat(safe);
    if (typeof window !== "undefined") localStorage.setItem(LS_FIAT, safe);

    await savePrefsToServer({ fiatCurrency: safe });
    router.refresh();
  }

  return (
    <>
      {/* icon */}
      <button
        onClick={() => setOpen(true)}
        className="cursor-pointer text-xl text-white"
        aria-label="Open menu"
      >
        ☰
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          {/* drawer */}
          <div className="absolute top-0 right-0 bg-[#0f1424] text-white w-72 max-w-[85vw] h-full p-5 shadow-2xl overflow-y-auto border-l border-white/10">
            {/* close */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-white/80">{T.settings}</div>
              <button
                onClick={() => setOpen(false)}
                className="text-red-300 hover:text-red-200 text-sm font-bold"
              >
                ✕ {T.close}
              </button>
            </div>

            {/* prefs */}
            <div className="space-y-3 mb-6">
              <div>
                <div className="text-xs text-white/60 font-semibold mb-1">{T.language}</div>
                <select
                  value={lang}
                  onChange={(e) => applyLang(e.target.value)}
                  className="w-full bg-[#0b1020] border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  {LANGS.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-xs text-white/60 font-semibold mb-1">{T.currency}</div>
                <select
                  value={fiat}
                  onChange={(e) => applyFiat(e.target.value)}
                  className="w-full bg-[#0b1020] border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  {FIATS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] text-white/40">
                Note: This changes formatting across the app. Amount values remain the same unless you add FX conversion.
              </p>
            </div>

            {/* nav */}
            <nav className="flex flex-col gap-2">
              {links.map(({ href, key }) => {
                const label = T.nav[key] || key;
                const active = pathname === href;

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={[
                      "px-4 py-2 rounded-xl transition-all duration-200",
                      "hover:bg-white/5 hover:text-blue-300 hover:pl-7 hover:shadow-md",
                      "hover:border-l-4 hover:border-blue-400",
                      active ? "bg-white/5 font-bold text-blue-300 border-l-4 border-blue-400" : "text-white/85",
                    ].join(" ")}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
