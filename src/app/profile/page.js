// src/app/page.js  (SERVER)
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";  // <-- note the path
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

// your client components
import DashBoard from "@/app/home/components/DashBoard";
import PromoSlider from "@/app/home/components/PromoSlider";;
import LivePriceBar from "@/app/home/components/LivePriceBar";
import CoinList from "@/app/home/components/CoinList";
import TopStocksChart from "@/app/home/components/TopStocksChart";
import QuickActions from "@/app/home/components/QuickActions";
import RecentTransactions from "@/app/home/components/RecentTransactions";

export const dynamic = "force-dynamic";
const prisma = new PrismaClient();

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?next=/");

  // fetch only this user’s latest 5 tx for the “Recent” widget
  const recent = await prisma.tx.findMany({
    where: { wallet: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <main className="bg-[#10141c] min-h-screen">
      <div className="w-full min-h-screen flex flex-col items-stretch justify-start">
        <div className="w-full bg-[#1b2030] rounded-none sm:rounded-2xl shadow-2xl p-0 sm:p-8 pt-7 flex flex-col gap-4">
          <DashBoard />

          <QuickActions
            onDeposit={() => (window.location.href = "/transactions")}
            onWithdraw={() => (window.location.href = "/transactions")}
            onTransfer={() => (window.location.href = "/transactions")}
          />

          {/* Recent Transactions now uses *real* data */}
          <RecentTransactions items={recent} />

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
