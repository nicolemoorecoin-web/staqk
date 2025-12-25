// src/app/home/page.js

import Link from "next/link";

// server/client components you already have
import DashBoard from "./components/DashBoard";
import PromoSlider from "./components/PromoSlider";
import LivePriceBar from "./components/LivePriceBar";
import CoinList from "./components/CoinList";
import TopStocksChart from "./components/TopStocksChart";

// this is a client component (has "use client" inside its file)
import QuickActions from "../components/QuickActions";

// server wrapper that fetches the user’s tx and renders the client list
import RecentTransactions from "../components/RecentTransactions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <main className="bg-[#10141c] min-h-screen">
      <div className="w-full min-h-screen flex flex-col items-stretch">
        <div className="w-full bg-[#1b2030] rounded-none sm:rounded-2xl shadow-2xl p-0 sm:p-8 pt-7 flex flex-col gap-4">
          <DashBoard />
          <QuickActions />

          

          <RecentTransactions limit={3} />

          <div className="px-4">
            <LivePriceBar />
          </div>

          <PromoSlider />
          <CoinList />
          <TopStocksChart />
        </div>
      </div>
    </main>
  );
}
