"use client";
import Link from "next/link";
import { useEffect } from "react";
import { HiUserCircle } from "react-icons/hi";
import { FaArrowUp, FaArrowDown, FaExchangeAlt } from "react-icons/fa";
import { useWalletStore } from "../../../lib/walletStore";

export default function Dashboard() {
  const { user, setUser, setBalances, balances } = useWalletStore();

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/me", { cache: "no-store" });
        const j = await r.json();
        if (j.ok) {
          setUser({ name: j.user.name, email: j.user.email });
          setBalances(j.balances);
        }
      } catch (e) {
        console.error("me fetch failed", e);
      }
    })();
  }, [setUser, setBalances]);

  const total = Number(balances?.total ?? 0);
  const income = Number(balances?.income ?? 0);
  const expense = Number(balances?.expense ?? 0);

  return (
    <section>
      {/* Greeting */}
      <div className="flex items-center gap-3 px-6 pt-2 pb-4">
        <HiUserCircle className="w-10 h-10 text-blue-400" />
        <span className="text-white text-lg">
          Hi, <span className="font-semibold">{user?.name ?? "User"}</span>
        </span>
      </div>

      {/* Balance card */}
      <div className="w-full px-4 pb-2">
        <div className="w-full rounded-xl bg-gradient-to-tr from-blue-700 to-blue-400 shadow-lg px-6 py-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white text-lg font-medium opacity-90">
              Available Balance
            </span>
            <Link
              href="/account/deposit"
              className="bg-black/40 text-white text-xs font-semibold px-3 py-1 rounded-lg hover:bg-opacity-70"
            >
              Top Up
            </Link>
          </div>

          <div className="mb-4">
            <span
              className="inline-block text-white font-extrabold tracking-tight"
              style={{ fontSize: "42px", lineHeight: "1" }} // weight 800
            >
              ${total.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <div>
              <span className="text-xs text-white/80 block">Income</span>
              <span className="text-green-200 font-semibold">
                + ${income.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-white/80 block">Expenses</span>
              <span className="text-red-200 font-semibold">
                - ${expense.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/account/deposit"
            className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl bg-[#161b26] hover:bg-blue-900/20 text-white font-medium text-sm shadow"
          >
            <FaArrowUp className="text-blue-300 text-lg" />
            <span>Deposit</span>
          </Link>

          <Link
            href="/account/withdraw"
            className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl bg-[#161b26] hover:bg-blue-900/20 text-white font-medium text-sm shadow"
          >
            <FaArrowDown className="text-blue-300 text-lg" />
            <span>Withdraw</span>
          </Link>

          <Link
            href="/account/transfer"
            className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl bg-[#161b26] hover:bg-blue-900/20 text-white font-medium text-sm shadow"
          >
            <FaExchangeAlt className="text-blue-300 text-lg" />
            <span>Transfer</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
