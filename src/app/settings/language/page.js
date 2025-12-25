"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCheck } from "react-icons/fi";

const LANGS = [
  { label: "English", code: "en" },
  { label: "Français", code: "fr" },
  { label: "Español", code: "es" },
  { label: "Deutsch", code: "de" },
  { label: "العربية", code: "ar" },
  { label: "中文", code: "zh" },
];

export default function LanguageSettingsPage() {
  const router = useRouter();
  const [sel, setSel] = useState("en");
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/me/preferences", { cache: "no-store" });
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.ok && j.language) {
          setSel(j.language);
          localStorage.setItem("pref.languageCode", j.language);
          localStorage.setItem("pref.language", j.language);
          return;
        }
      } catch {}
      const local = localStorage.getItem("pref.languageCode") || localStorage.getItem("pref.language");
      if (local) setSel(local);
    })();
  }, []);

  async function save(code) {
    setErr(null);
    setSel(code);

    // instant local update
    localStorage.setItem("pref.languageCode", code);
    localStorage.setItem("pref.language", code);

    // ✅ notify same-tab listeners (global provider)
    window.dispatchEvent(new CustomEvent("staqk:prefs-updated", { detail: { language: code } }));

    try {
      const r = await fetch("/api/me/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: code }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || "Failed to save");
    } catch (e) {
      setErr(e.message || "Could not save");
    }
  }

  return (
    <main className="bg-[#10141c] min-h-screen">
      <div className="flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-[#10141c]/95 backdrop-blur z-10">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
          <FiArrowLeft size={22} />
        </button>
        <h1 className="text-white text-lg font-bold">Language</h1>
        <div className="w-6" />
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-2">
        {LANGS.map((lang) => (
          <button
            key={lang.code}
            onClick={() => save(lang.code)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition flex items-center justify-between
              ${
                sel === lang.code
                  ? "border-blue-600 bg-blue-600/10 text-white"
                  : "border-blue-900/30 bg-[#151a28] text-gray-200 hover:bg-white/5"
              }`}
          >
            <span>{lang.label}</span>
            {sel === lang.code && <FiCheck className="text-blue-400" />}
          </button>
        ))}

        {err && (
          <div className="mt-3 text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {err}
          </div>
        )}
      </div>
    </main>
  );
}
