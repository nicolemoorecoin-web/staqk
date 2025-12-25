// src/lib/i18n.js

export const LANGS = [
  { label: "English", code: "en" },
  { label: "Français", code: "fr" },
  { label: "Español", code: "es" },
  { label: "Deutsch", code: "de" },
  { label: "العربية", code: "ar" },
  { label: "中文", code: "zh" },
];

export const LANG_LABEL_TO_CODE = Object.fromEntries(LANGS.map(l => [l.label, l.code]));
export const LANG_CODE_TO_LABEL = Object.fromEntries(LANGS.map(l => [l.code, l.label]));

export function normalizeLang(input) {
  if (!input) return "en";
  const v = String(input).trim();
  if (!v) return "en";

  // label -> code
  if (LANG_LABEL_TO_CODE[v]) return LANG_LABEL_TO_CODE[v];

  // code
  const code = v.toLowerCase();
  if (LANG_CODE_TO_LABEL[code]) return code;

  return "en";
}

export function langLabel(code) {
  return LANG_CODE_TO_LABEL[normalizeLang(code)] || "English";
}

const DICT = {
  en: {
    me: {
      hi: "Hi",
      preferences: "Preferences",
      app: "App",
      darkMode: "Dark Mode",
      language: "Language",
      defaultCurrencies: "Default Currencies",
      priceAlert: "Price Alert",
      converter: "Converter",
      airdrop: "Airdrop",
      widgets: "Widgets",
      settings: "Settings",
      helpCenter: "Help Center",
      seeAll: "See All",
    },
  },
  es: {
    me: {
      hi: "Hola",
      preferences: "Preferencias",
      app: "Aplicación",
      darkMode: "Modo oscuro",
      language: "Idioma",
      defaultCurrencies: "Monedas predeterminadas",
      priceAlert: "Alerta de precio",
      converter: "Convertidor",
      airdrop: "Airdrop",
      widgets: "Widgets",
      settings: "Configuración",
      helpCenter: "Centro de ayuda",
      seeAll: "Ver todo",
    },
  },
  // (You can add fr/de/ar/zh later)
};

export function t(lang, key, fallback) {
  const L = normalizeLang(lang);
  const parts = String(key).split(".");
  let cur = DICT[L] || DICT.en;

  for (const p of parts) {
    cur = cur?.[p];
  }
  return (typeof cur === "string" && cur) ? cur : (fallback ?? key);
}
