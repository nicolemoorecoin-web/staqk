// src/app/home/page.js
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import DashBoard from "./components/DashBoard";
import RecentTransactions from "./components/RecentTransactions";
import PromoSlider from "./components/PromoSlider";
import LivePriceBar from "./components/LivePriceBar";
import CoinList from "./components/CoinList";
import TopStocksChart from "./components/TopStocksChart";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="bg-[#10141c] min-h-screen">
      <div className="w-full min-h-screen flex flex-col items-stretch justify-start">
        <div className="w-full bg-[#1b2030] rounded-none sm:rounded-2xl shadow-2xl p-0 sm:p-8 pt-7 flex flex-col items-stretch gap-4">

          {/* Dashboard includes greeting + Top Up */}
          <DashBoard />

          {/* Recent Transactions — single header (from component) */}
          <RecentTransactions onViewAll={() => router.push("/account/activity")} />

          {/* Live prices ticker */}
          <div className="px-4">
            <LivePriceBar />
          </div>

          {/* Promo slider */}
          <PromoSlider />

          {/* Coins + Watchlist */}
          <CoinList />

          {/* Stocks chart */}
          <TopStocksChart />
        </div>
      </div>
    </main>
  );
}
