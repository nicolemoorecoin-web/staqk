"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCheck } from "react-icons/fi";

const LANGS = ["English", "Français", "Español", "Deutsch", "العربية", "中文"];

export default function LanguageSettingsPage() {
  const router = useRouter();
  const [sel, setSel] = useState("English");

  // Load saved language
  useEffect(() => {
    const saved = localStorage.getItem("pref.language");
    if (saved) setSel(saved);
  }, []);

  // Save to localStorage
  function save(lang) {
    setSel(lang);
    localStorage.setItem("pref.language", lang);
  }

  return (
    <main className="bg-[#10141c] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-[#10141c]/95 backdrop-blur z-10">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white"
        >
          <FiArrowLeft size={22} />
        </button>
        <h1 className="text-white text-lg font-bold">Language</h1>
        <div className="w-6" />
      </div>

      {/* Language List */}
      <div className="max-w-xl mx-auto p-4 space-y-2">
        {LANGS.map((lang) => (
          <button
            key={lang}
            onClick={() => save(lang)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition flex items-center justify-between
              ${
                sel === lang
                  ? "border-blue-600 bg-blue-600/10 text-white"
                  : "border-blue-900/30 bg-[#151a28] text-gray-200 hover:bg-white/5"
              }`}
          >
            <span>{lang}</span>
            {sel === lang && <FiCheck className="text-blue-400" />}
          </button>
        ))}
      </div>
    </main>
  );
}