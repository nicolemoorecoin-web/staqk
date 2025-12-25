// src/app/home/components/DashBoard.js
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HiUserCircle } from "react-icons/hi";
import { useWalletStore } from "../../../lib/walletStore";
import { useAppPrefs } from "../../components/AppPrefsProvider";

export default function Dashboard() {
  const { t, formatMoney } = useAppPrefs();

  // fallback user from Zustand
  const storeUser = useWalletStore((s) => s.user);
  const storeBalances = useWalletStore((s) => s.balances);

  // summary from API (single source of truth)
  const [summary, setSummary] = useState(null);

  // ✅ avatar from DB (profile)
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/account/summary", { cache: "no-store" });
        if (!r.ok) return;
        const j = await r.json();
        setSummary(j);
      } catch (err) {
        console.error("Failed to fetch /api/account/summary in Dashboard", err);
      }
    })();
  }, []);

  // ✅ fetch avatar from DB profile endpoint
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const r = await fetch("/api/me/profile", { cache: "no-store" });
        const j = await r.json().catch(() => ({}));
        if (!mounted) return;
        if (!r.ok || j?.ok === false) return;
        setAvatar(j?.profile?.avatar || null);
      } catch (err) {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ instant updates after saving profile photo (same tab)
  useEffect(() => {
    function onProfileUpdated(e) {
      const d = e?.detail || {};
      if (d.avatar !== undefined) setAvatar(d.avatar || null);
    }
    window.addEventListener("staqk:profile-updated", onProfileUpdated);
    return () => window.removeEventListener("staqk:profile-updated", onProfileUpdated);
  }, []);

  // ✅ safe bucket sum (ignore mirrored/alias keys)
  const safeBucketTotal = (buckets) => {
    if (!buckets) return null;

    const skip = new Set([
      "earnWallet", // mirror of investments in your store
      "investmentsMirror",
      "total",
      "income",
      "expense",
    ]);

    let sum = 0;
    for (const [k, v] of Object.entries(buckets)) {
      if (skip.has(k)) continue;
      sum += Number(v) || 0;
    }
    return sum;
  };

  const bucketTotal = useMemo(() => safeBucketTotal(summary?.buckets), [summary?.buckets]);

  // ✅ prefer server-computed totalUsd always
  const totalUsd = Number(
    summary?.totalUsd ??
      summary?.total ??
      (bucketTotal != null ? bucketTotal : null) ??
      storeBalances?.total ??
      0
  );

  const incomeUsd = Number(summary?.incomeUsd ?? summary?.income ?? storeBalances?.income ?? 0);
  const expenseUsd = Number(summary?.expenseUsd ?? summary?.expense ?? storeBalances?.expense ?? 0);

  const displayName =
    summary?.user?.name ||
    summary?.user?.username ||
    storeUser?.name ||
    storeUser?.username ||
    "User";

  return (
    <section>
      {/* Header: avatar + greeting */}
      <div className="flex items-center gap-3 px-6 pt-2 pb-4">
        {/* ✅ clickable avatar -> /profile/edit */}
        <Link href="/profile/edit" className="shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/25 border border-white/10"
            />
          ) : (
            <HiUserCircle className="w-10 h-10 text-blue-400" />
          )}
        </Link>

        <span className="text-white text-lg">
          {t("Hello")},{" "}
          <span className="font-bold">{displayName}</span>
        </span>
      </div>

      <div className="w-full px-4 pb-4">
        <div className="w-full rounded-xl bg-gradient-to-tr from-blue-700 to-blue-400 shadow-lg px-6 py-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white text-lg font-semibold opacity-90">
              {t("Available Balance")}
            </span>
            <Link
              href="/account/deposit"
              className="bg-black/40 text-white text-xs font-bold px-3 py-1 rounded-lg hover:bg-opacity-70"
            >
              {t("Top Up")}
            </Link>
          </div>

          <div className="mb-4">
            <span
              className="inline-block text-white font-black tracking-tight"
              style={{ fontSize: "42px", lineHeight: "1" }}
            >
              {formatMoney(totalUsd, { maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between">
            <div>
              <span className="text-xs text-white/80 block">{t("income")}</span>
              <span className="text-green-200 font-bold">
                + {formatMoney(incomeUsd, { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-white/80 block">{t("expenses")}</span>
              <span className="text-red-200 font-bold">
                - {formatMoney(expenseUsd, { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
