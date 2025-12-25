// src/app/settings/page.js
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiGlobe,
  FiDollarSign,
  FiRefreshCw,
  FiShield,
  FiLock,
  FiBell,
  FiMoon,
  FiEye,
  FiEyeOff,
  FiTrash2,
  FiUserCheck,
} from "react-icons/fi";

import SignOutButton from "../components/SignOutButton";
import { useWalletStore } from "../../lib/walletStore";

export default function SettingsPage() {
  const router = useRouter();
  const email = useWalletStore((s) => s.user?.email) || "user@example.com";

  // Prefs
  const [language, setLanguage] = useState("English");
  const [fiat, setFiat] = useState("USD");
  const [crypto, setCrypto] = useState("BTC");

  const [darkMode, setDarkMode] = useState(true);
  const [hideBalances, setHideBalances] = useState(false);
  const [privateProfile, setPrivateProfile] = useState(false);

  const [priceAlerts, setPriceAlerts] = useState(true);
  const [systemPush, setSystemPush] = useState(true);
  const [marketingEmail, setMarketingEmail] = useState(false);

  const [requirePassForTransfer, setRequirePassForTransfer] = useState(false);

  useEffect(() => {
    setLanguage(localStorage.getItem("pref.language") || "English");
    setFiat(localStorage.getItem("pref.fiat") || "USD");
    setCrypto(localStorage.getItem("pref.crypto") || "BTC");

    setDarkMode((localStorage.getItem("pref.darkMode") || "true") === "true");
    setHideBalances((localStorage.getItem("pref.hideBalances") || "false") === "true");
    setPrivateProfile((localStorage.getItem("pref.privateProfile") || "false") === "true");

    setPriceAlerts((localStorage.getItem("pref.alerts.price") || "true") === "true");
    setSystemPush((localStorage.getItem("pref.alerts.push") || "true") === "true");
    setMarketingEmail((localStorage.getItem("pref.alerts.marketing") || "false") === "true");

    setRequirePassForTransfer(
      (localStorage.getItem("pref.requirePasswordForTransfer") || "false") === "true"
    );
  }, []);

  useEffect(() => {
    localStorage.setItem("pref.darkMode", String(darkMode));
    const html = document.documentElement;
    darkMode ? html.classList.add("dark") : html.classList.remove("dark");
  }, [darkMode]);

  const persist = (k, v) => localStorage.setItem(k, String(v));

  // Password form (real API-backed)
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmNext, setConfirmNext] = useState("");
  const [show, setShow] = useState({ cur: false, next: false, conf: false });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState(null);
  const [pwdMessage, setPwdMessage] = useState(null);

  const canChange =
    current.length > 0 && next.length >= 8 && next === confirmNext;

  const handleChangePassword = async () => {
    setPwdError(null);
    setPwdMessage(null);

    if (next.length < 8) {
      setPwdError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirmNext) {
      setPwdError("New password and confirmation do not match.");
      return;
    }

    try {
      setPwdLoading(true);

      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: current,
          newPassword: next,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Unable to update password.");
      }

      setCurrent("");
      setNext("");
      setConfirmNext("");
      setPwdMessage("Password updated successfully.");
    } catch (err) {
      setPwdError(err.message || "Something went wrong.");
    } finally {
      setPwdLoading(false);
    }
  };

  const resetLocalData = () => {
    if (!confirm("This will clear local settings and cached wallet data on this device. Continue?"))
      return;
    localStorage.removeItem("staqk_wallet");
    localStorage.removeItem("pref.language");
    localStorage.removeItem("pref.fiat");
    localStorage.removeItem("pref.crypto");
    localStorage.removeItem("pref.darkMode");
    localStorage.removeItem("pref.hideBalances");
    localStorage.removeItem("pref.privateProfile");
    localStorage.removeItem("pref.alerts.price");
    localStorage.removeItem("pref.alerts.push");
    localStorage.removeItem("pref.alerts.marketing");
    localStorage.removeItem("pref.requirePasswordForTransfer");
    alert("Local data cleared. The page will reload.");
    location.reload();
  };

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

      <div className="max-w-xl mx-auto p-4 space-y-5">
        {/* Preferences */}
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
          <Row
            href="/tools/converter"
            icon={<FiRefreshCw className="text-gray-400" />}
            title="Converter"
            subtitle="Swap fiat ↔ crypto with live rates"
          />
        </Card>

        {/* Appearance */}
        <Card>
          <Header title="Appearance" />
          <ToggleRow
            icon={<FiMoon className="text-gray-400" />}
            title="Dark Mode"
            checked={darkMode}
            onChange={(v) => setDarkMode(v)}
          />
        </Card>

        {/* Notifications */}
        <Card>
          <Header title="Notifications" />
          <ToggleRow
            icon={<FiBell className="text-gray-400" />}
            title="Price Alerts"
            subtitle="Get alerted when markets move"
            checked={priceAlerts}
            onChange={(v) => {
              setPriceAlerts(v);
              persist("pref.alerts.price", v);
            }}
          />
          <ToggleRow
            icon={<FiBell className="text-gray-400" />}
            title="System Push"
            subtitle="Deposits, withdrawals, and security alerts"
            checked={systemPush}
            onChange={(v) => {
              setSystemPush(v);
              persist("pref.alerts.push", v);
            }}
          />
          <ToggleRow
            icon={<FiBell className="text-gray-400" />}
            title="Marketing Emails"
            subtitle="Occasional product updates"
            checked={marketingEmail}
            onChange={(v) => {
              setMarketingEmail(v);
              persist("pref.alerts.marketing", v);
            }}
          />
        </Card>

        {/* Privacy */}
        <Card>
          <Header title="Privacy" />
          <ToggleRow
            icon={<FiUserCheck className="text-gray-400" />}
            title="Private Profile"
            subtitle="Only you can see your profile details"
            checked={privateProfile}
            onChange={(v) => {
              setPrivateProfile(v);
              persist("pref.privateProfile", v);
            }}
          />
          <ToggleRow
            icon={<FiShield className="text-gray-400" />}
            title="Hide Balances"
            subtitle="Blur balance amounts on dashboards"
            checked={hideBalances}
            onChange={(v) => {
              setHideBalances(v);
              persist("pref.hideBalances", v);
            }}
          />
        </Card>

        {/* Security */}
        <Card>
          <Header title="Security" />
          <RowStatic icon={<FiLock className="text-gray-400" />} title="Account Email" subtitle={email} />
          <ToggleRow
            icon={<FiShield className="text-gray-400" />}
            title="Require password to transfer"
            subtitle="Ask for your password before internal transfers"
            checked={requirePassForTransfer}
            onChange={(v) => {
              setRequirePassForTransfer(v);
              persist("pref.requirePasswordForTransfer", v);
            }}
          />

          <div className="px-4 py-3 space-y-3">
            <div className="text-white font-semibold">Change Password</div>

            <PasswordInput
              label="Current password"
              value={current}
              onChange={setCurrent}
              reveal={show.cur}
              onToggleReveal={() => setShow((s) => ({ ...s, cur: !s.cur }))}
            />

            <PasswordInput
              label="New password"
              value={next}
              onChange={setNext}
              reveal={show.next}
              onToggleReveal={() => setShow((s) => ({ ...s, next: !s.next }))}
            />

            <PasswordInput
              label="Confirm new password"
              value={confirmNext}
              onChange={setConfirmNext}
              reveal={show.conf}
              onToggleReveal={() => setShow((s) => ({ ...s, conf: !s.conf }))}
            />

            {pwdError && (
              <p className="text-xs text-red-400">{pwdError}</p>
            )}
            {pwdMessage && !pwdError && (
              <p className="text-xs text-emerald-400">{pwdMessage}</p>
            )}

            <button
              disabled={!canChange || pwdLoading}
              onClick={handleChangePassword}
              className={`w-full rounded-xl py-3 font-bold transition ${
                canChange && !pwdLoading
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {pwdLoading ? "Saving..." : "Save Password"}
            </button>

            <p className="text-[11px] text-gray-400">
              Your password is stored securely. After changing it, use the new password next time you sign in.
            </p>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card>
          <Header title="Danger Zone" />
          <div className="px-4 py-3">
            <button
              onClick={resetLocalData}
              className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl"
            >
              <FiTrash2 /> Clear Local App Data
            </button>
            <p className="text-[11px] text-gray-400 mt-2">
              Removes local preferences and cached wallet data (this browser only).
            </p>
          </div>
        </Card>

        {/* Sign out */}
        <div className="pt-2">
          <SignOutButton className="w-full" />
        </div>
      </div>
    </main>
  );
}

/* ───────── UI bits ───────── */

function Card({ children }) {
  return (
    <section className="bg-[#151a28] rounded-2xl border border-blue-900/30 shadow-xl overflow-hidden divide-y divide-blue-900/20">
      {children}
    </section>
  );
}

function Header({ title }) {
  return (
    <div className="px-4 py-3">
      <h3 className="text-white/90 font-bold">{title}</h3>
    </div>
  );
}

function Row({ href, icon, title, subtitle }) {
  return (
    <Link href={href} className="px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition">
      {icon}
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium">{title}</div>
        {subtitle && <div className="text-xs text-gray-400 truncate">{subtitle}</div>}
      </div>
      <span className="text-gray-500">›</span>
    </Link>
  );
}

function RowStatic({ icon, title, subtitle }) {
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      {icon}
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium">{title}</div>
        {subtitle && <div className="text-xs text-gray-400 truncate">{subtitle}</div>}
      </div>
    </div>
  );
}

function ToggleRow({ icon, title, subtitle, checked, onChange }) {
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      {icon}
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium">{title}</div>
        {subtitle && <div className="text-xs text-gray-400 truncate">{subtitle}</div>}
      </div>
      <Toggle checked={checked} onChange={() => onChange(!checked)} />
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
      <span
        className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function PasswordInput({ label, value, onChange, reveal, onToggleReveal }) {
  return (
    <label className="block">
      <span className="text-gray-300 text-sm font-semibold">{label}</span>
      <div className="mt-1 relative">
        <input
          type={reveal ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white pr-10"
        />
        <button
          type="button"
          onClick={onToggleReveal}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
          aria-label={reveal ? "Hide" : "Show"}
        >
          {reveal ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
    </label>
  );
}
