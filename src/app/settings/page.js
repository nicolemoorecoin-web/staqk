"use client";

import Link from "next/link";
import { FiArrowLeft, FiGlobe, FiDollarSign, FiRefreshCw } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SignOutButton from "../components/SignOutButton";

export default function SettingsPage() {
  const router = useRouter();
  const [language, setLanguage] = useState("English");
  const [fiat, setFiat] = useState("USD");
  const [crypto, setCrypto] = useState("BTC");

  // Load saved preferences on mount
  useEffect(() => {
    const lang = localStorage.getItem("pref.language");
    const f = localStorage.getItem("pref.fiat");
    const c = localStorage.getItem("pref.crypto");
    if (lang) setLanguage(lang);
    if (f) setFiat(f);
    if (c) setCrypto(c);
  }, []);

  return (
    <main className="bg-[#10141c] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-[#10141c]/95 backdrop-blur z-10">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
          <FiArrowLeft size={22} />
        </button>
        <h1 className="text-white text-lg font-bold">Settings</h1>
        <div className="w-6" />
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        <Card>
          <Row
            href="/settings/language"
            icon={<FiGlobe className="text-gray-400" />}
            title="Language"
            subtitle={language}
          />
          <Row
            href="/settings/currency"
            icon={<FiDollarSign className="text-gray-400" />}
            title="Default Currencies"
            subtitle={`${fiat} & ${crypto}`}
          />
        </Card>

        <Card>
          <Row
            href="/tools/converter"
            icon={<FiRefreshCw className="text-gray-400" />}
            title="Converter"
            subtitle="Swap fiat ↔ crypto with live rates"
          />
        </Card>

        {/* Sign out (also available on /me) */}
        <div className="pt-2">
          <SignOutButton className="w-full" />
        </div>
      </div>
    </main>
  );
}

function Card({ children }) {
  return (
    <section className="bg-[#151a28] rounded-2xl border border-blue-900/30 shadow-xl overflow-hidden divide-y divide-blue-900/20">
      {children}
    </section>
  );
}

function Row({ href, icon, title, subtitle }) {
  return (
    <Link
      href={href}
      className="px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition"
    >
      {icon}
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium">{title}</div>
        {subtitle && <div className="text-xs text-gray-400 truncate">{subtitle}</div>}
      </div>
      <span className="text-gray-500">›</span>
    </Link>
  );
}
