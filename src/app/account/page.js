// src/app/account/page.js
"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useWalletStore } from "../../lib/walletStore";
import {
  FaWallet, FaCoins, FaPiggyBank, FaChartLine, FaLock,
  FaArrowUp, FaArrowDown, FaExchangeAlt
} from "react-icons/fa";
import { IoMdEye } from "react-icons/io";

// tiny sparkline svg
function Sparkline({ data, color = "#3b82f6" }) {
  if (!data?.length) return null;
  const w = 60, h = 24;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i * w) / (data.length - 1);
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return <svg width={w} height={h}><polyline fill="none" stroke={color} strokeWidth="2" points={pts} opacity="0.85" /></svg>;
}

function PortfolioPie({ assets }) {
  const total = assets.reduce((s, a) => s + a.value, 0) || 1;
  const colors = ["#3b82f6","#10b981","#fbbf24","#a78bfa","#f472b6"];
  let acc = 0;
  return (
    <svg viewBox="0 0 32 32" width={80} height={80}>
      {assets.map((a, i) => {
        const pct = (a.value / total) * 100;
        const start = (acc / 100) * 2 * Math.PI;
        acc += pct;
        const end = (acc / 100) * 2 * Math.PI;
        const x1 = 16 + 16 * Math.sin(start);
        const y1 = 16 - 16 * Math.cos(start);
        const x2 = 16 + 16 * Math.sin(end);
        const y2 = 16 - 16 * Math.cos(end);
        const large = pct > 50 ? 1 : 0;
        return <path key={i} d={`M16,16 L${x1},${y1} A16,16 0 ${large},1 ${x2},${y2} Z`} fill={colors[i % colors.length]} opacity="0.9" />;
      })}
    </svg>
  );
}

function ActionLink({ href, icon, label }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 px-7 py-3 rounded-2xl bg-[#161b26] hover:bg-blue-900/20 text-white font-semibold text-sm shadow transition-all">
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function AccountPage() {
  const { balances } = useWalletStore();
  const [showBalance, setShowBalance] = useState(true);
  useEffect(() => {
    const saved = sessionStorage.getItem("showBalance");
    if (saved !== null) setShowBalance(saved === "1");
  }, []);
  useEffect(() => {
    sessionStorage.setItem("showBalance", showBalance ? "1" : "0");
  }, [showBalance]);

  // Build ASSETS from buckets so this page mirrors Home/Deposit/etc
  const ASSETS = useMemo(() => {
    const b = balances?.buckets || {};
    const rows = [
      { name: "Crypto", key: "crypto", icon: <FaCoins className="w-7 h-7 text-blue-400" />, spark: [100,102,104,102,108,111,110] },
      { name: "Cash", key: "cash", icon: <FaWallet className="w-7 h-7 text-green-400" />, spark: [900,930,920,960,930,970,980] },
      { name: "Earn Wallet", key: "earnWallet", icon: <FaPiggyBank className="w-7 h-7 text-yellow-300" />, spark: [500,505,510,520,540,550,600] },
      { name: "Staking", key: "staking", icon: <FaLock className="w-7 h-7 text-pink-300" />, spark: [0,5,15,30,40,50,45] },
      { name: "Crypto Earn", key: "earn", icon: <FaChartLine className="w-7 h-7 text-purple-300" />, spark: [1000,1001,1002,1001,1005,1010,1008] },
    ].map(r => ({ ...r, value: Number(b[r.key] ?? 0) }));

    const sum = rows.reduce((s, a) => s + a.value, 0) || 1;
    rows.forEach(a => (a.percent = Math.round((a.value / sum) * 100)));
    return rows;
  }, [balances]);

  const total = balances?.total ?? ASSETS.reduce((s, a) => s + a.value, 0);

  return (
    <main className="bg-[#10141c] min-h-screen pb-32 px-0 pt-2 font-sans">
      {/* Summary card */}
      <section className="max-w-2xl mx-auto w-full mt-4 mb-7">
        <div className="rounded-3xl shadow-2xl bg-[#161b26]/70 border border-blue-900/50 backdrop-blur-lg p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-lg text-gray-300 font-medium">Total Balance</span>
            <div className="flex items-center gap-3">
              <Link href="/account/activity" className="text-blue-300 hover:text-blue-200 text-sm font-semibold">
                View Activity
              </Link>
              <button onClick={() => setShowBalance(v => !v)} className="text-blue-400 text-lg hover:text-blue-300">
                <IoMdEye className="inline-block mr-1" /> {showBalance ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {showBalance ? `$${total.toLocaleString(undefined,{maximumFractionDigits:2})}` : "******"}
              <span className="text-lg font-medium text-gray-400 ml-1">USD</span>
            </span>
            <PortfolioPie assets={ASSETS} />
          </div>

          <div className="text-gray-400 text-sm mb-1">+2.24% today • Last updated 3m ago</div>
        </div>
      </section>

      {/* Filters */}
      <div className="flex justify-center gap-2 mb-4">
        {["24H","1W","1M","3M","6M"].map(f => (
          <button key={f} className="px-4 py-1 rounded-full border bg-transparent border-gray-600 text-gray-400 font-medium text-sm">
            {f}
          </button>
        ))}
      </div>

      {/* Assets list */}
      <section className="max-w-2xl mx-auto w-full flex flex-col gap-4 px-4">
        {ASSETS.map((a, i) => (
          <div key={a.name} className="bg-[#181d2b] rounded-2xl flex items-center justify-between px-5 py-4 shadow-md hover:bg-blue-900/10 transition">
            <div className="flex items-center gap-4">
              <span>{a.icon}</span>
              <div>
                <div className="text-white font-semibold text-lg">{a.name}</div>
                <div className="text-gray-500 text-xs">{a.percent}% of portfolio</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xl font-bold text-white">{showBalance ? `$${a.value.toLocaleString(undefined,{maximumFractionDigits:2})}` : "****"}</span>
              <span className="text-gray-500 text-xs">Today</span>
              <Sparkline data={a.spark} color={["#3b82f6","#10b981","#fbbf24","#a78bfa","#f472b6"][i%5]} />
            </div>
          </div>
        ))}
      </section>

      {/* Actions */}
      <div className="max-w-2xl mx-auto w-full flex justify-center gap-4 mt-8">
        <ActionLink href="/account/deposit" icon={<FaArrowUp />} label="Deposit" />
        <ActionLink href="/account/withdraw" icon={<FaArrowDown />} label="Withdraw" />
        <ActionLink href="/account/transfer" icon={<FaExchangeAlt />} label="Transfer" />
      </div>
    </main>
  );
}
