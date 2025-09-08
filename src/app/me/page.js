"use client";

// ✅ alias removed — relative path from /profile to /components
import SignOutButton from "../components/SignOutButton";

import { useEffect, useState } from "react";
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

export default function ProfilePage() {
  const [user] = useState({
    name: (typeof window !== "undefined" && localStorage.getItem("staqk_user_name")) || "Henry",
    email: "henry@example.com",
    avatar: null,
  });

  const [darkMode, setDarkMode] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem("pref.darkMode");
    if (saved != null) setDarkMode(saved === "true");
  }, []);
  useEffect(() => {
    localStorage.setItem("pref.darkMode", String(darkMode));
    const html = document.documentElement;
    if (darkMode) html.classList.add("dark");
    else html.classList.remove("dark");
  }, [darkMode]);

  const [language, setLanguage] = useState(
    () => localStorage.getItem("pref.language") || "English"
  );
  const [currencies, setCurrencies] = useState(() => {
    const fiat = localStorage.getItem("pref.fiat") || "USD";
    const crypto = localStorage.getItem("pref.crypto") || "BTC";
    return `${fiat} & ${crypto}`;
  });

  return (
    <main className="bg-[#10141c] min-h-screen pb-28">
      <div className="max-w-xl mx-auto px-4 pt-8">
        {/* Header (tap to edit profile) */}
        <section className="bg-[#151a28] rounded-2xl border border-blue-900/30 p-5 shadow-xl">
          <Link href="/profile/edit" className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/70"
              />
            ) : (
              <HiUserCircle className="w-14 h-14 text-blue-400" />
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-white truncate">
                Hi, {user.name}
              </h1>
              <p className="text-gray-400 text-sm truncate">{user.email}</p>
            </div>
            <FiChevronRight className="ml-auto text-gray-500" />
          </Link>

          {/* Alert card */}
          <div className="mt-5 bg-[#11182a] rounded-2xl px-4 py-3 shadow-inner border border-blue-900/20">
            <div className="flex items-start gap-2">
              <span className="mt-1 block w-2 h-2 rounded-full bg-red-400" />
              <p className="text-gray-200 text-sm leading-relaxed">
                Ethereum (ETH) price is approaching{" "}
                <span className="font-semibold">$4,300</span>
              </p>
            </div>
            <Link
              href="/notifications"
              className="mt-3 block w-full text-center text-blue-300 font-semibold"
            >
              See All
            </Link>
          </div>

          {/* Quick actions */}
          <div className="mt-5 grid grid-cols-4 gap-3">
            <QuickAction href="/notifications" icon={<FiBell />} label="Price Alert" />
            <QuickAction href="/tools/converter" icon={<FiRefreshCw />} label="Converter" />
            <QuickAction href="/rewards/airdrop" icon={<FiGift />} label="Airdrop" />
            <QuickAction href="/settings/widgets" icon={<FiGrid />} label="Widgets" />
          </div>
        </section>

        {/* Preferences */}
        <section className="mt-6 bg-[#151a28] rounded-2xl border border-blue-900/30 shadow-xl overflow-hidden">
          <GroupHeader title="Preferences" />
          <ul className="divide-y divide-blue-900/20">
            <ToggleRow
              title="Dark Mode"
              value={darkMode}
              onChange={() => setDarkMode((v) => !v)}
            />
            <LinkRow
              title="Language"
              subtitle={language}
              icon={<FiGlobe className="text-gray-400" />}
              href="/settings/language"
            />
            <LinkRow
              title="Default Currencies"
              subtitle={currencies}
              icon={<FiDollarSign className="text-gray-400" />}
              href="/settings/currency"
            />
          </ul>
        </section>

        {/* App */}
        <section className="mt-6 bg-[#151a28] rounded-2xl border border-blue-900/30 shadow-xl overflow-hidden">
          <GroupHeader title="App" />
          <ul className="divide-y divide-blue-900/20">
            <LinkRow title="Widgets"  icon={<FiGrid className="text-gray-400" />}     href="/settings/widgets" />
            <LinkRow title="Settings" icon={<FiSettings className="text-gray-400" />} href="/settings" />
            <LinkRow title="Help Center" icon={<FiHelpCircle className="text-gray-400" />} href="/support/help-center" />
          </ul>
        </section>

        {/* Logout */}
        <SignOutButton className="mt-6 w-full" />
      </div>
    </main>
  );
}

/* ───────── components ───────── */

function QuickAction({ icon, label, href = "#" }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-[#1a2140] to-[#121a32] border border-blue-900/30 py-3 hover:from-[#212a50] hover:to-[#141d3a] transition"
    >
      <div className="text-xl text-blue-300 mb-1">{icon}</div>
      <span className="text-xs text-gray-200 font-semibold text-center leading-tight">
        {label}
      </span>
    </Link>
  );
}

function GroupHeader({ title }) {
  return (
    <div className="px-4 py-3">
      <h3 className="text-white/90 font-bold">{title}</h3>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-blue-500" : "bg-gray-600"}`}
      aria-pressed={checked}
    >
      <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
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
