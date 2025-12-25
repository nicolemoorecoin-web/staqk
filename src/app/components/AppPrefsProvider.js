"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AppPrefsContext = createContext(null);

// Backward-compatible normalization (your old pages stored labels like "English")
function normalizeLanguage(v) {
  if (!v) return "en";
  const s = String(v).toLowerCase().trim();

  if (s === "english" || s === "en") return "en";
  if (s === "français" || s === "french" || s === "fr" || s === "francais") return "fr";
  if (s === "español" || s === "spanish" || s === "es" || s === "espanol") return "es";
  if (s === "deutsch" || s === "german" || s === "de") return "de";
  if (s === "العربية" || s === "arabic" || s === "ar") return "ar";
  if (s === "中文" || s === "chinese" || s === "zh") return "zh";

  if (["en", "fr", "es", "de", "ar", "zh"].includes(s)) return s;
  return "en";
}

function normalizeCurrency(v, fallback) {
  const s = String(v || fallback || "").trim().toUpperCase();
  return s || String(fallback || "").toUpperCase() || "USD";
}

const LANGUAGE_LABEL = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  ar: "العربية",
  zh: "中文",
};

const isRTL = (lang) => lang === "ar";

function langToLocale(lang) {
  const l = normalizeLanguage(lang);
  if (l === "fr") return "fr-FR";
  if (l === "es") return "es-ES";
  if (l === "de") return "de-DE";
  if (l === "ar") return "ar";
  if (l === "zh") return "zh-CN";
  return "en-US";
}

// Minimal translations (only affects components that use `t()`)
const MESSAGES = {
  en: {
    preferences: "Preferences",
    darkMode: "Dark Mode",
    language: "Language",
    defaultCurrencies: "Default Currencies",
    app: "App",
    settings: "Settings",
    helpCenter: "Help Center",
    signOut: "Sign out",
    quickChange: "Quick change",
    saving: "Saving…",

    deposit: "Deposit",
    withdraw: "Withdraw",
    transfer: "Transfer",

    recentTransactions: "Recent Transactions",
    viewAll: "View all",
    noTransactionsYet: "No transactions yet",

    coin: "Coin",
    watchlist: "Watchlist",
    hours24: "24 hours",
    price: "Price",
  },
  fr: {
    preferences: "Préférences",
    darkMode: "Mode sombre",
    language: "Langue",
    defaultCurrencies: "Devises par défaut",
    app: "Application",
    settings: "Paramètres",
    helpCenter: "Centre d’aide",
    signOut: "Se déconnecter",
    quickChange: "Changement rapide",
    saving: "Enregistrement…",

    deposit: "Dépôt",
    withdraw: "Retrait",
    transfer: "Transfert",

    recentTransactions: "Transactions récentes",
    viewAll: "Voir tout",
    noTransactionsYet: "Aucune transaction",

    coin: "Coin",
    watchlist: "Favoris",
    hours24: "24 h",
    price: "Prix",
  },
  es: {
    preferences: "Preferencias",
    darkMode: "Modo oscuro",
    language: "Idioma",
    defaultCurrencies: "Monedas predeterminadas",
    app: "App",
    settings: "Ajustes",
    helpCenter: "Centro de ayuda",
    signOut: "Cerrar sesión",
    quickChange: "Cambio rápido",
    saving: "Guardando…",

    deposit: "Depositar",
    withdraw: "Retirar",
    transfer: "Transferir",

    recentTransactions: "Transacciones recientes",
    viewAll: "Ver todo",
    noTransactionsYet: "Sin transacciones",

    coin: "Moneda",
    watchlist: "Favoritos",
    hours24: "24 h",
    price: "Precio",
  },
  de: {
    preferences: "Einstellungen",
    darkMode: "Dunkelmodus",
    language: "Sprache",
    defaultCurrencies: "Standardwährungen",
    app: "App",
    settings: "Einstellungen",
    helpCenter: "Hilfe",
    signOut: "Abmelden",
    quickChange: "Schnell ändern",
    saving: "Speichern…",

    deposit: "Einzahlen",
    withdraw: "Abheben",
    transfer: "Überweisen",

    recentTransactions: "Letzte Transaktionen",
    viewAll: "Alle anzeigen",
    noTransactionsYet: "Noch keine Transaktionen",

    coin: "Coin",
    watchlist: "Watchlist",
    hours24: "24 Std.",
    price: "Preis",
  },
  ar: {
    preferences: "التفضيلات",
    darkMode: "الوضع الداكن",
    language: "اللغة",
    defaultCurrencies: "العملات الافتراضية",
    app: "التطبيق",
    settings: "الإعدادات",
    helpCenter: "مركز المساعدة",
    signOut: "تسجيل الخروج",
    quickChange: "تغيير سريع",
    saving: "جارٍ الحفظ…",

    deposit: "إيداع",
    withdraw: "سحب",
    transfer: "تحويل",

    recentTransactions: "المعاملات الأخيرة",
    viewAll: "عرض الكل",
    noTransactionsYet: "لا توجد معاملات",

    coin: "عملة",
    watchlist: "المفضلة",
    hours24: "24 ساعة",
    price: "السعر",
  },
  zh: {
    preferences: "偏好设置",
    darkMode: "深色模式",
    language: "语言",
    defaultCurrencies: "默认货币",
    app: "应用",
    settings: "设置",
    helpCenter: "帮助中心",
    signOut: "退出登录",
    quickChange: "快速更改",
    saving: "保存中…",

    deposit: "充值",
    withdraw: "提现",
    transfer: "转账",

    recentTransactions: "最近交易",
    viewAll: "查看全部",
    noTransactionsYet: "暂无交易",

    coin: "币种",
    watchlist: "自选",
    hours24: "24小时",
    price: "价格",
  },
};

export default function AppPrefsProvider({ children }) {
  const [language, setLanguageState] = useState("en");
  const [fiatCurrency, setFiatCurrencyState] = useState("USD");
  const [cryptoCurrency, setCryptoCurrencyState] = useState("BTC");

  // USD -> selected fiat conversion rate
  const [usdToFiatRate, setUsdToFiatRate] = useState(1);
  const [ratesReady, setRatesReady] = useState(false);

  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Boot from localStorage (fallback / legacy)
  useEffect(() => {
    try {
      const rawLang =
        localStorage.getItem("pref.languageCode") ||
        localStorage.getItem("pref.language");

      const l = normalizeLanguage(rawLang);
      const f = normalizeCurrency(localStorage.getItem("pref.fiat"), "USD");
      const c = normalizeCurrency(localStorage.getItem("pref.crypto"), "BTC");

      setLanguageState(l);
      setFiatCurrencyState(f);
      setCryptoCurrencyState(c);
    } catch {}
  }, []);

  // Hydrate from DB
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/me/preferences", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!alive) return;

        if (res.ok && data?.ok) {
          if (data.language) setLanguageState(normalizeLanguage(data.language));
          if (data.fiatCurrency) setFiatCurrencyState(normalizeCurrency(data.fiatCurrency, "USD"));
          if (data.cryptoCurrency) setCryptoCurrencyState(normalizeCurrency(data.cryptoCurrency, "BTC"));
        }
      } catch {
        // ignore (user might be logged out)
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Apply html lang/dir globally (so Arabic becomes RTL)
  useEffect(() => {
    try {
      document.documentElement.lang = language || "en";
      document.documentElement.dir = isRTL(language) ? "rtl" : "ltr";
    } catch {}
  }, [language]);

  // ✅ Same-tab instant sync: listen to custom event + cross-tab storage
  useEffect(() => {
    function onPrefsUpdated(e) {
      const next = e?.detail || {};
      if (next.language) setLanguageState(normalizeLanguage(next.language));
      if (next.fiatCurrency) setFiatCurrencyState(normalizeCurrency(next.fiatCurrency, fiatCurrency));
      if (next.cryptoCurrency) setCryptoCurrencyState(normalizeCurrency(next.cryptoCurrency, cryptoCurrency));
    }

    function onStorage(ev) {
      if (!ev?.key) return;
      if (ev.key === "pref.language" || ev.key === "pref.languageCode") {
        const raw = localStorage.getItem("pref.languageCode") || localStorage.getItem("pref.language");
        setLanguageState(normalizeLanguage(raw));
      }
      if (ev.key === "pref.fiat") setFiatCurrencyState(normalizeCurrency(localStorage.getItem("pref.fiat"), "USD"));
      if (ev.key === "pref.crypto") setCryptoCurrencyState(normalizeCurrency(localStorage.getItem("pref.crypto"), "BTC"));
    }

    window.addEventListener("staqk:prefs-updated", onPrefsUpdated);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("staqk:prefs-updated", onPrefsUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, [fiatCurrency, cryptoCurrency]);

  // Fetch USD -> fiat rate (safe + optional)
  useEffect(() => {
    let alive = true;
    (async () => {
      const fiat = normalizeCurrency(fiatCurrency, "USD");
      setRatesReady(false);

      if (fiat === "USD") {
        if (alive) {
          setUsdToFiatRate(1);
          setRatesReady(true);
        }
        return;
      }

      try {
        // Free endpoint (no key). If it fails, we fall back to 1.
        const res = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${encodeURIComponent(fiat)}`);
        const json = await res.json().catch(() => ({}));
        const rate = Number(json?.rates?.[fiat]);
        if (alive) {
          setUsdToFiatRate(Number.isFinite(rate) && rate > 0 ? rate : 1);
          setRatesReady(true);
        }
      } catch {
        if (alive) {
          setUsdToFiatRate(1);
          setRatesReady(true);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [fiatCurrency]);

  // Save helper (DB + keep localStorage in sync)
  async function patchPrefs(next) {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/me/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Could not save preferences");

      // Sync localStorage for fallback compatibility
      if (next.language) {
        const code = normalizeLanguage(next.language);
        localStorage.setItem("pref.languageCode", code);
        localStorage.setItem("pref.language", LANGUAGE_LABEL[code] || "English");
      }
      if (next.fiatCurrency) localStorage.setItem("pref.fiat", normalizeCurrency(next.fiatCurrency, "USD"));
      if (next.cryptoCurrency) localStorage.setItem("pref.crypto", normalizeCurrency(next.cryptoCurrency, "BTC"));

      // Update state
      if (next.language) setLanguageState(normalizeLanguage(next.language));
      if (next.fiatCurrency) setFiatCurrencyState(normalizeCurrency(next.fiatCurrency, "USD"));
      if (next.cryptoCurrency) setCryptoCurrencyState(normalizeCurrency(next.cryptoCurrency, "BTC"));
    } catch (e) {
      setError(e?.message || "Could not save preferences");
      throw e;
    } finally {
      setSaving(false);
    }
  }

  const value = useMemo(() => {
    const lang = normalizeLanguage(language);
    const langLabel = LANGUAGE_LABEL[lang] || "English";
    const locale = langToLocale(lang);

    const t = (key) => (MESSAGES[lang] && MESSAGES[lang][key]) || MESSAGES.en[key] || key;

    // USD -> fiat formatting (all your app values are USD, convert for display)
    const formatMoney = (usdAmount, options = {}) => {
      const usd = Number(usdAmount || 0);
      const cur = normalizeCurrency(fiatCurrency, "USD");
      const rate = Number(usdToFiatRate) || 1;
      const converted = usd * rate;

      try {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency: cur,
          maximumFractionDigits: 2,
          ...options,
        }).format(converted);
      } catch {
        // fallback
        return `${cur} ${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
      }
    };

    return {
      ready,
      saving,
      error,

      language: lang,
      languageLabel: langLabel,
      locale,

      fiatCurrency: normalizeCurrency(fiatCurrency, "USD"),
      cryptoCurrency: normalizeCurrency(cryptoCurrency, "BTC"),

      usdToFiatRate,
      ratesReady,

      formatMoney,
      t,

      setLanguage: (code) => patchPrefs({ language: normalizeLanguage(code) }),
      setFiatCurrency: (code) => patchPrefs({ fiatCurrency: normalizeCurrency(code, "USD") }),
      setCryptoCurrency: (code) => patchPrefs({ cryptoCurrency: normalizeCurrency(code, "BTC") }),
    };
  }, [ready, saving, error, language, fiatCurrency, cryptoCurrency, usdToFiatRate, ratesReady]);

  return <AppPrefsContext.Provider value={value}>{children}</AppPrefsContext.Provider>;
}

export function useAppPrefs() {
  const ctx = useContext(AppPrefsContext);
  if (!ctx) throw new Error("useAppPrefs must be used inside <AppPrefsProvider />");
  return ctx;
}
