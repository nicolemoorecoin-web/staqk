"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  FiDollarSign,
  FiDownload,
  FiUpload,
  FiPieChart,
  FiCreditCard,
  FiChevronRight,
} from "react-icons/fi";

// Utility just for formatting numbers like 760,529.13
const fmt = (n) =>
  Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function InvestAccountPage() {
  // Demo data — swap with real values later
  const data = useMemo(
    () => ({
      totalAvailable: 760529.13,
      main: {
        title: "Main Account",
        number: "RGL001887",
        opened: "30.09.2024",
        valuation: 1281539.67,
        currentInvestment: 521010.54,
        availableBalance: 760529.13,
      },
      venture: {
        title: "Venture Capital",
        number: "V984721124",
        opened: "12.07.2022",
        valuation: 318422.0,
        currentInvestment: 270000.0,
        availableBalance: 48422.0,
      },
    }),
    []
  );

  const mainPct =
    data.main.valuation === 0
      ? 0
      : (data.main.currentInvestment / data.main.valuation) * 100;

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900">
      {/* Page header */}
      <header className="max-w-md mx-auto w-full px-4 pt-6 pb-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900/90">
          My Trading Account
        </h1>

        {/* Tabs row */}
        <div className="mt-4 flex items-center gap-3 text-sm">
          <button className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
            Balances
          </button>
          <button className="px-3 py-1.5 rounded-full bg-gray-100 text-slate-700 font-medium flex items-center gap-1">
            Operations <span className="ml-1 inline-flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-slate-900/10 text-slate-900/70 text-xs font-semibold">2</span>
          </button>
          <button className="px-3 py-1.5 rounded-full bg-gray-100 text-slate-700 font-medium">
            Statement
          </button>
          <button className="px-3 py-1.5 rounded-full bg-gray-100 text-slate-700 font-medium">
            Information
          </button>
        </div>
      </header>

      <section className="max-w-md mx-auto w-full px-4 pb-28">
        {/* Total available balance card */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 px-4 py-4 mb-4">
          <p className="text-slate-500 text-sm">Total available balance</p>
          <div className="mt-1 text-3xl font-semibold tracking-tight">
            ${fmt(data.totalAvailable)}
          </div>

          <div className="mt-4 flex gap-3">
            <Link
              href="/account/deposit"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 text-white font-semibold py-3"
            >
              <FiDownload className="text-lg" />
              Deposit
            </Link>
            <Link
              href="/account/withdraw"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white text-slate-800 font-semibold py-3"
            >
              <FiUpload className="text-lg" />
              Withdraw
            </Link>
          </div>
        </div>

        {/* Main account card */}
        <AccountCard
          icon={<FiCreditCard />}
          title={data.main.title}
          number={data.main.number}
          opened={data.main.opened}
          valuation={data.main.valuation}
          currentInvestment={data.main.currentInvestment}
          availableBalance={data.main.availableBalance}
          progressPct={mainPct}
        />

        {/* Another account example (Venture Capital) */}
        <AccountCard
          accent="rose"
          icon={<FiPieChart />}
          title="Venture Capital"
          number={data.venture.number}
          opened={data.venture.opened}
          valuation={data.venture.valuation}
          currentInvestment={data.venture.currentInvestment}
          availableBalance={data.venture.availableBalance}
          progressPct={
            data.venture.valuation
              ? (data.venture.currentInvestment / data.venture.valuation) * 100
              : 0
          }
        />
      </section>

      {/* Bottom tab bar (optional) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200">
        <div className="max-w-md mx-auto flex items-center justify-between px-6 py-3 text-slate-700">
          <Tab icon={<FiDollarSign />} label="Main" href="/" />
          <Tab icon={<FiPieChart />} label="Portfolio" href="/account" />
          <div className="relative -mt-8">
            <Link
              href="/cart"
              className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg"
              aria-label="Cart"
            >
              15
            </Link>
          </div>
          <Tab icon={<FiCreditCard />} label="Account" href="/account" badge="7" />
          <Tab icon={<FiChevronRight />} label="Me" href="/me" />
        </div>
      </nav>
    </main>
  );
}

/** --- Small components --- **/

function AccountCard({
  icon,
  title,
  number,
  opened,
  valuation,
  currentInvestment,
  availableBalance,
  progressPct,
  accent = "emerald",
}) {
  const fmt = (n) =>
    Number(n).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const barBg =
    accent === "emerald" ? "bg-emerald-200" : "bg-rose-200";
  const barFill =
    accent === "emerald" ? "bg-violet-500" : "bg-rose-500";
  const barRest =
    accent === "emerald" ? "bg-emerald-500" : "bg-rose-400";

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-200 px-4 py-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-600 grid place-items-center">
            {icon}
          </div>
          <div>
            <div className="text-base font-semibold text-slate-900/90">
              {title}
            </div>
            <div className="text-xs text-slate-500">№ {number}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Opened</div>
          <div className="text-xs font-medium text-slate-700">{opened}</div>
        </div>
      </div>

      <div className="mt-4 text-2xl font-semibold tracking-tight">
        ${fmt(valuation)}
      </div>
      <div className="text-slate-500 text-sm">Portfolio Valuation</div>

      {/* Progress bar */}
      <div className={`mt-4 w-full h-2 rounded-full ${barBg} overflow-hidden`}>
        <div
          className={`h-2 ${barFill}`}
          style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
        />
        <div className={`h-2 ${barRest}`} style={{ width: "100%" }} />
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
          <span className="text-slate-600">Current investment</span>
        </div>
        <div className="text-right font-semibold text-slate-900/80">
          ${fmt(currentInvestment)}
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-slate-600">Available balance</span>
        </div>
        <div className="text-right font-semibold text-emerald-600">
          ${fmt(availableBalance)}
        </div>
      </div>
    </div>
  );
}

function Tab({ icon, label, href, badge }) {
  return (
    <Link href={href} className="relative grid place-items-center gap-1 text-xs">
      <div className="text-xl">{icon}</div>
      <span className="text-slate-700">{label}</span>
      {badge ? (
        <span className="absolute -top-1 -right-2 text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}