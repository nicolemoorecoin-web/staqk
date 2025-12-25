"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiChevronRight,
  FiBell,
  FiRefreshCw,
  FiGift,
  FiSettings,
  FiHelpCircle,
  FiGlobe,
  FiDollarSign,
  FiGrid,
} from "react-icons/fi";
import { HiUserCircle } from "react-icons/hi";
import SignOutButton from "../components/SignOutButton";
import { useWalletStore } from "../../lib/walletStore";

/**
 * MeClient (DB-backed preferences + real UI translations)
 * - Reads preferences from /api/me/preferences (GET)
 * - Saves preferences to /api/me/preferences (PATCH)
 * - Reads profile from /api/me/profile (GET) to pull avatar
 * - Reacts instantly in SAME TAB using custom events:
 *    - "staqk:prefs-updated"
 *    - "staqk:profile-updated"
 */

// ---- Language normalization (handles "Spanish" vs "es" etc) ----
const LANG_ALIASES = {
  en: "en",
  english: "en",
  "en-us": "en",
  "en-gb": "en",

  fr: "fr",
  french: "fr",
  français: "fr",
  francais: "fr",

  es: "es",
  spanish: "es",
  español: "es",
  espanol: "es",

  de: "de",
  german: "de",
  deutsch: "de",

  ar: "ar",
  arabic: "ar",
  العربية: "ar",

  zh: "zh",
  chinese: "zh",
  中文: "zh",
};

function normalizeLang(v) {
  if (!v) return "en";
  const s = String(v).trim();
  if (!s) return "en";
  const key = s.toLowerCase();
  return LANG_ALIASES[key] || (key.length === 2 ? key : "en");
}

const LANGUAGE_LABEL = {
  en: "English",
  fr: "French",
  es: "Spanish",
  de: "Deutsch",
  ar: "العربية",
  zh: "中文",
};

// ---- Translations for Me page UI ----
const I18N = {
  en: {
    hi: "Hi",
    seeAll: "See All",
    preferences: "Preferences",
    app: "App",
    darkMode: "Dark Mode",
    language: "Language",
    defaultCurrencies: "Default Currencies",
    quickChange: "Quick change",
    saving: "Saving…",
    priceAlert: "Price Alert",
    converter: "Converter",
    airdrop: "Airdrop",
    widgets: "Widgets",
    settings: "Settings",
    helpCenter: "Help Center",
  },
  es: {
    hi: "Hola",
    seeAll: "Ver todo",
    preferences: "Preferencias",
    app: "Aplicación",
    darkMode: "Modo oscuro",
    language: "Idioma",
    defaultCurrencies: "Monedas predeterminadas",
    quickChange: "Cambio rápido",
    saving: "Guardando…",
    priceAlert: "Alerta de precio",
    converter: "Convertidor",
    airdrop: "Airdrop",
    widgets: "Widgets",
    settings: "Configuración",
    helpCenter: "Centro de ayuda",
  },
  fr: {
    hi: "Salut",
    seeAll: "Voir tout",
    preferences: "Préférences",
    app: "Application",
    darkMode: "Mode sombre",
    language: "Langue",
    defaultCurrencies: "Devises par défaut",
    quickChange: "Changement rapide",
    saving: "Enregistrement…",
    priceAlert: "Alerte de prix",
    converter: "Convertisseur",
    airdrop: "Airdrop",
    widgets: "Widgets",
    settings: "Paramètres",
    helpCenter: "Centre d’aide",
  },
  de: {
    hi: "Hallo",
    seeAll: "Alle ansehen",
    preferences: "Einstellungen",
    app: "App",
    darkMode: "Dunkelmodus",
    language: "Sprache",
    defaultCurrencies: "Standardwährungen",
    quickChange: "Schnell ändern",
    saving: "Speichert…",
    priceAlert: "Preisalarm",
    converter: "Konverter",
    airdrop: "Airdrop",
    widgets: "Widgets",
    settings: "Einstellungen",
    helpCenter: "Hilfe",
  },
  ar: {
    hi: "مرحبًا",
    seeAll: "عرض الكل",
    preferences: "التفضيلات",
    app: "التطبيق",
    darkMode: "الوضع الداكن",
    language: "اللغة",
    defaultCurrencies: "العملات الافتراضية",
    quickChange: "تغيير سريع",
    saving: "جارٍ الحفظ…",
    priceAlert: "تنبيه السعر",
    converter: "محول",
    airdrop: "إيردروب",
    widgets: "ودجات",
    settings: "الإعدادات",
    helpCenter: "مركز المساعدة",
  },
  zh: {
    hi: "你好",
    seeAll: "查看全部",
    preferences: "偏好设置",
    app: "应用",
    darkMode: "深色模式",
    language: "语言",
    defaultCurrencies: "默认货币",
    quickChange: "快速更改",
    saving: "保存中…",
    priceAlert: "价格提醒",
    converter: "换算器",
    airdrop: "空投",
    widgets: "组件",
    settings: "设置",
    helpCenter: "帮助中心",
  },
};

function t(lang, key) {
  const L = normalizeLang(lang);
  return I18N[L]?.[key] || I18N.en[key] || key;
}

// ---- localStorage helpers (legacy-friendly) ----
function readLocalPrefs() {
  if (typeof window === "undefined") {
    return { language: "en", fiatCurrency: "USD", cryptoCurrency: "BTC" };
  }

  const rawLang =
    localStorage.getItem("pref.languageCode") ||
    localStorage.getItem("pref.language") ||
    "en";

  const fiat = localStorage.getItem("pref.fiat") || "USD";
  const crypto = localStorage.getItem("pref.crypto") || "BTC";

  return {
    language: normalizeLang(rawLang),
    fiatCurrency: String(fiat).toUpperCase(),
    cryptoCurrency: String(crypto).toUpperCase(),
  };
}

function writeLocalPrefs(next) {
  if (typeof window === "undefined") return;

  if (next.language) {
    const code = normalizeLang(next.language);
    localStorage.setItem("pref.languageCode", code);
    localStorage.setItem("pref.language", code);
  }
  if (next.fiatCurrency) localStorage.setItem("pref.fiat", String(next.fiatCurrency).toUpperCase());
  if (next.cryptoCurrency) localStorage.setItem("pref.crypto", String(next.cryptoCurrency).toUpperCase());
}

export default function MeClient({
  initialName,
  initialEmail,

  // optional (safe if you don’t pass them)
  initialLanguage,
  initialFiatCurrency,
  initialCryptoCurrency,

  notifText,
}) {
  const name = initialName || "User";
  const email = initialEmail || "user@example.com";

  // theme from zustand store
  const theme = useWalletStore((s) => s.theme || "dark");
  const setTheme = useWalletStore((s) => s.setTheme);
  const darkMode = theme === "dark";

  // local fallback (fast)
  const local = useMemo(() => readLocalPrefs(), []);

  const [lang, setLang] = useState(() => normalizeLang(initialLanguage || local.language || "en"));
  const [fiatCurrency, setFiatCurrency] = useState(() =>
    String(initialFiatCurrency || local.fiatCurrency || "USD").toUpperCase()
  );
  const [cryptoCurrency, setCryptoCurrency] = useState(() =>
    String(initialCryptoCurrency || local.cryptoCurrency || "BTC").toUpperCase()
  );

  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsError, setPrefsError] = useState(null);

  // ✅ NEW: avatar pulled from DB
  const [avatar, setAvatar] = useState(null);

  const languageLabel = useMemo(
    () => LANGUAGE_LABEL[normalizeLang(lang)] || "English",
    [lang]
  );
  const currenciesLabel = useMemo(
    () => `${fiatCurrency} & ${cryptoCurrency}`,
    [fiatCurrency, cryptoCurrency]
  );

  // ✅ NEW: Pull profile (avatar) on mount
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/api/me/profile", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!mounted) return;
        if (!res.ok || data?.ok === false) return;

        setAvatar(data?.profile?.avatar || null);
      } catch {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Pull real DB prefs on mount (source of truth)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/api/me/preferences", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!mounted) return;
        if (!res.ok || !data?.ok) return;

        const nextLang = normalizeLang(data.language);
        const nextFiat = String(data.fiatCurrency || fiatCurrency || "USD").toUpperCase();
        const nextCrypto = String(data.cryptoCurrency || cryptoCurrency || "BTC").toUpperCase();

        setLang(nextLang);
        setFiatCurrency(nextFiat);
        setCryptoCurrency(nextCrypto);

        writeLocalPrefs({ language: nextLang, fiatCurrency: nextFiat, cryptoCurrency: nextCrypto });
      } catch {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SAME TAB instant updates (storage event doesn't fire in same tab)
  useEffect(() => {
    function onPrefsUpdated(e) {
      const d = e?.detail || {};
      if (d.language) setLang(normalizeLang(d.language));
      if (d.fiatCurrency) setFiatCurrency(String(d.fiatCurrency).toUpperCase());
      if (d.cryptoCurrency) setCryptoCurrency(String(d.cryptoCurrency).toUpperCase());
    }

    window.addEventListener("staqk:prefs-updated", onPrefsUpdated);
    return () => window.removeEventListener("staqk:prefs-updated", onPrefsUpdated);
  }, []);

  // ✅ NEW: same-tab avatar update from Edit Profile
  useEffect(() => {
    function onProfileUpdated(e) {
      const d = e?.detail || {};
      if (d.avatar !== undefined) setAvatar(d.avatar || null);
    }
    window.addEventListener("staqk:profile-updated", onProfileUpdated);
    return () => window.removeEventListener("staqk:profile-updated", onProfileUpdated);
  }, []);

  async function savePreferences(next) {
    setPrefsError(null);
    setSavingPrefs(true);

    // optimistic UI + local storage mirror
    if (next.language) setLang(normalizeLang(next.language));
    if (next.fiatCurrency) setFiatCurrency(String(next.fiatCurrency).toUpperCase());
    if (next.cryptoCurrency) setCryptoCurrency(String(next.cryptoCurrency).toUpperCase());
    writeLocalPrefs(next);

    try {
      const res = await fetch("/api/me/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(next.language ? { language: normalizeLang(next.language) } : {}),
          ...(next.fiatCurrency ? { fiatCurrency: String(next.fiatCurrency).toUpperCase() } : {}),
          ...(next.cryptoCurrency ? { cryptoCurrency: String(next.cryptoCurrency).toUpperCase() } : {}),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.error || "Could not save preferences");
    } catch (e) {
      setPrefsError(e?.message || "Could not save preferences");
    } finally {
      setSavingPrefs(false);
    }
  }

  return (
    <main className="min-h-screen pb-28 bg-app text-app">
      <div className="max-w-xl mx-auto px-4 pt-8">
        <section className="card-app rounded-2xl border border-blue-900/30 p-5 shadow-xl">
          <Link href="/profile/edit" className="flex items-center gap-4">
            {/* ✅ NEW avatar rendering */}
            {avatar ? (
              <img
                src={avatar}
                alt="profile"
                className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-500/25 border border-white/10"
              />
            ) : (
              <HiUserCircle className="w-14 h-14 text-blue-400" />
            )}

            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold truncate">
                {t(lang, "hi")}, {name}
              </h1>
              <p className="text-gray-400 text-sm truncate">{email}</p>
            </div>
            <FiChevronRight className="ml-auto text-gray-500" />
          </Link>

          {notifText && (
            <div className="mt-5 rounded-2xl px-4 py-3 shadow-inner border border-blue-900/20 bg-[#11182a]">
              <div className="flex items-start gap-2">
                <span className="mt-1 block w-2 h-2 rounded-full bg-red-400" />
                <p className="text-gray-200 text-sm leading-relaxed">{notifText}</p>
              </div>
              <Link href="/transactions" className="mt-3 block w-full text-center text-blue-300 font-semibold">
                {t(lang, "seeAll")}
              </Link>
            </div>
          )}

          <div className="mt-5 grid grid-cols-4 gap-3">
            <QuickAction href="/notifications" icon={<FiBell />} label={t(lang, "priceAlert")} />
            <QuickAction href="/tools/converter" icon={<FiRefreshCw />} label={t(lang, "converter")} />
            <QuickAction href="/rewards/airdrop" icon={<FiGift />} label={t(lang, "airdrop")} />
            <QuickAction href="/settings/widgets" icon={<FiGrid />} label={t(lang, "widgets")} />
          </div>
        </section>

        <section className="mt-6 card-app rounded-2xl border border-blue-900/30 shadow-xl overflow-hidden">
          <GroupHeader title={t(lang, "preferences")} />
          <ul className="divide-y divide-blue-900/20">
            <ToggleRow
              title={t(lang, "darkMode")}
              value={darkMode}
              onChange={() => setTheme(darkMode ? "light" : "dark")}
            />

            <LinkRow
              title={t(lang, "language")}
              subtitle={savingPrefs ? `${languageLabel} • ${t(lang, "saving")}` : languageLabel}
              icon={<FiGlobe className="text-gray-400" />}
              href="/settings/language"
            />

            <LinkRow
              title={t(lang, "defaultCurrencies")}
              subtitle={savingPrefs ? `${currenciesLabel} • ${t(lang, "saving")}` : currenciesLabel}
              icon={<FiDollarSign className="text-gray-400" />}
              href="/settings/currency"
            />
          </ul>

          {(prefsError || savingPrefs) && (
            <div className="px-4 py-3 text-xs">
              {prefsError ? (
                <div className="text-red-300">{prefsError}</div>
              ) : (
                <div className="text-gray-400">{t(lang, "saving")}</div>
              )}
            </div>
          )}

          <details className="px-4 pb-4">
            <summary className="cursor-pointer text-sm text-blue-300 select-none">
              {t(lang, "quickChange")}
            </summary>

            <div className="mt-3 grid grid-cols-1 gap-3">
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-gray-400">
                  {t(lang, "language")}
                  <select
                    value={normalizeLang(lang)}
                    onChange={(e) => savePreferences({ language: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-[#0b1020] border border-blue-900/30 px-3 py-2 text-white"
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                    <option value="de">Deutsch</option>
                    <option value="ar">العربية</option>
                    <option value="zh">中文</option>
                  </select>
                </label>

                <label className="text-xs text-gray-400">
                  Fiat
                  <select
                    value={fiatCurrency}
                    onChange={(e) => savePreferences({ fiatCurrency: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-[#0b1020] border border-blue-900/30 px-3 py-2 text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="NGN">NGN</option>
                    <option value="CAD">CAD</option>
                    <option value="JPY">JPY</option>
                    <option value="AUD">AUD</option>
                  </select>
                </label>
              </div>

              <label className="text-xs text-gray-400">
                Crypto
                <select
                  value={cryptoCurrency}
                  onChange={(e) => savePreferences({ cryptoCurrency: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-[#0b1020] border border-blue-900/30 px-3 py-2 text-white"
                >
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="USDT">USDT</option>
                  <option value="SOL">SOL</option>
                </select>
              </label>

              <p className="text-[11px] text-gray-500">
                These changes save to your account (database) and persist across devices.
              </p>
            </div>
          </details>
        </section>

        <section className="mt-6 card-app rounded-2xl border border-blue-900/30 shadow-xl overflow-hidden">
          <GroupHeader title={t(lang, "app")} />
          <ul className="divide-y divide-blue-900/20">
            <LinkRow title={t(lang, "widgets")} icon={<FiGrid className="text-gray-400" />} href="/settings/widgets" />
            <LinkRow title={t(lang, "settings")} icon={<FiSettings className="text-gray-400" />} href="/settings" />
            <LinkRow title={t(lang, "helpCenter")} icon={<FiHelpCircle className="text-gray-400" />} href="/support/help-center" />
          </ul>
        </section>

        <SignOutButton className="mt-6 w-full" />
      </div>
    </main>
  );
}

/* ---- small UI helpers ---- */

function QuickAction({ icon, label, href = "#" }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-[#1a2140] to-[#121a32] border border-blue-900/30 py-3 hover:from-[#212a50] hover:to-[#141d3a] transition"
    >
      <div className="text-xl text-blue-300 mb-1">{icon}</div>
      <span className="text-xs text-gray-200 font-semibold text-center leading-tight">{label}</span>
    </Link>
  );
}

function GroupHeader({ title }) {
  return (
    <div className="px-4 py-3">
      <h3 className="font-bold text-white/90">{title}</h3>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-blue-500" : "bg-gray-600"}`}
      aria-pressed={checked}
      type="button"
    >
      <span
        className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function RowShell({ children, href }) {
  const Cmp = href ? Link : "li";
  const props = href ? { href } : {};
  return (
    <Cmp {...props} className={`px-4 py-3 flex items-center gap-3 ${href ? "cursor-pointer active:opacity-90" : ""}`}>
      {children}
      {href && <FiChevronRight className="text-gray-500 ml-auto" />}
    </Cmp>
  );
}

function LinkRow({ title, subtitle, icon, href }) {
  return (
    <RowShell href={href}>
      {icon}
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium">{title}</div>
        {subtitle && <div className="text-xs text-gray-400 truncate">{subtitle}</div>}
      </div>
    </RowShell>
  );
}

function ToggleRow({ title, value, onChange }) {
  return (
    <li className="px-4 py-3 flex items-center gap-3">
      <div className="flex-1">
        <div className="text-white font-medium">{title}</div>
      </div>
      <Toggle checked={value} onChange={onChange} />
    </li>
  );
}
