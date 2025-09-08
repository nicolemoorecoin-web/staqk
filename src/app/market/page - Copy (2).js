"use client";
import { useState } from "react";
import { FaStar, FaChevronDown, FaArrowUp, FaArrowDown, FaSearch, FaFire } from "react-icons/fa";

// --- Demo Data (replace with API) ---
const COINS = [
  { symbol: "BTC", name: "Bitcoin", price: 68310, change: 2.1, cap: 1340000000000, icon: "/crypto/btc.svg" },
  { symbol: "ETH", name: "Ethereum", price: 3625, change: -1.4, cap: 426000000000, icon: "/crypto/eth.svg" },
  { symbol: "BNB", name: "Binance Coin", price: 612, change: 3.7, cap: 98400000000, icon: "/crypto/bnb.svg" },
  { symbol: "SOL", name: "Solana", price: 152, change: 5.2, cap: 67000000000, icon: "/crypto/sol.svg" },
  { symbol: "ADA", name: "Cardano", price: 0.432, change: -0.6, cap: 15000000000, icon: "/crypto/ada.svg" },
  // ... add more demo coins
];
const WATCHLIST = ["BTC", "ETH", "SOL"];
const NEWS = [
  { headline: "Bitcoin rebounds after Fed signals rate pause", link: "#" },
  { headline: "Ethereum Dencun upgrade launches successfully", link: "#" },
  { headline: "AI tokens lead altcoin rally, outperforming majors", link: "#" },
];
const STRATEGIES = [
  {
    title: "Dynamic Arbitrage Rotation",
    desc: "Capture risk-free profit from volatile pairs with 24/7 monitoring.",
    link: "#",
  },
  {
    title: "AI Quant Swing",
    desc: "Harness machine learning signals for high-probability trades.",
    link: "#",
  },
];

// --- Market Page ---
export default function MarketPage() {
  const [tab, setTab] = useState("Market");
  const [sortKey, setSortKey] = useState("cap");
  const [sortDir, setSortDir] = useState("desc");
  const [query, setQuery] = useState("");

  // Filter & sort
  const filtered = COINS
    .filter(
      (c) =>
        (!query || c.name.toLowerCase().includes(query.toLowerCase()) || c.symbol.toLowerCase().includes(query.toLowerCase())) &&
        (tab !== "Watchlist" || WATCHLIST.includes(c.symbol))
    )
    .sort((a, b) => {
      const vA = sortKey === "name" ? a.name : a[sortKey];
      const vB = sortKey === "name" ? b.name : b[sortKey];
      if (sortDir === "desc") return vB - vA;
      return vA - vB;
    });

  // Gainers/Losers tabs
  const topGainers = [...COINS].sort((a, b) => b.change - a.change).slice(0, 5);
  const topLosers = [...COINS].sort((a, b) => a.change - b.change).slice(0, 5);

  return (
    <main className="bg-[#10141c] min-h-screen pb-32 font-sans">
      <div className="max-w-5xl mx-auto px-2 sm:px-6 pt-8">
        {/* --- Banner + Live Tickers --- */}
        <section className="rounded-3xl bg-gradient-to-br from-[#171d2d]/80 to-[#222749]/90 shadow-2xl px-6 py-5 mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <FaFire className="text-orange-400 animate-pulse" />
            <span className="text-lg text-white font-bold tracking-wide">Live Market Overview</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {COINS.slice(0, 5).map((c) => (
              <div key={c.symbol} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#181d2b] shadow-md">
                <img src={c.icon} alt={c.symbol} className="w-6 h-6" />
                <span className="text-white font-medium">{c.symbol}</span>
                <span className="text-gray-400">${c.price.toLocaleString()}</span>
                <span className={c.change > 0 ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                  {c.change > 0 ? <FaArrowUp className="inline-block" /> : <FaArrowDown className="inline-block" />} {Math.abs(c.change).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* --- Tabs: Market, Watchlist, Gainers, Losers --- */}
        <div className="flex flex-wrap gap-2 items-center mb-2">
          {["Market", "Watchlist", "Top Gainers", "Top Losers"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${tab === t
                ? "bg-blue-700 border-blue-400 text-white shadow"
                : "bg-transparent border-gray-600 text-gray-300 hover:bg-blue-950"
                }`}
            >
              {t}
            </button>
          ))}
          <div className="flex-1"></div>
          <div className="flex items-center rounded-lg bg-[#181d2b] px-2 py-1">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              className="bg-transparent outline-none text-white text-sm"
              placeholder="Search asset…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* --- Table: Main Market --- */}
        <section className="rounded-2xl bg-[#181d2b]/90 shadow-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-blue-900/50">
                <th className="py-3 px-4 text-gray-400 text-xs font-bold">#</th>
                <th className="py-3 px-4 text-gray-400 text-xs font-bold cursor-pointer" onClick={() => setSortKey("name")}>Asset <FaChevronDown className="inline-block text-xs ml-1" /></th>
                <th className="py-3 px-4 text-gray-400 text-xs font-bold cursor-pointer" onClick={() => setSortKey("price")}>Price <FaChevronDown className="inline-block text-xs ml-1" /></th>
                <th className="py-3 px-4 text-gray-400 text-xs font-bold cursor-pointer" onClick={() => setSortKey("change")}>24h <FaChevronDown className="inline-block text-xs ml-1" /></th>
                <th className="py-3 px-4 text-gray-400 text-xs font-bold cursor-pointer" onClick={() => setSortKey("cap")}>Market Cap <FaChevronDown className="inline-block text-xs ml-1" /></th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {(tab === "Top Gainers"
                ? topGainers
                : tab === "Top Losers"
                  ? topLosers
                  : filtered
              ).map((coin, i) => (
                <tr key={coin.symbol} className="border-b border-blue-900/20 hover:bg-blue-900/10 transition">
                  <td className="py-3 px-4 text-xs text-gray-500">{i + 1}</td>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <img src={coin.icon} className="w-6 h-6" alt={coin.symbol} />
                    <span className="text-white font-medium">{coin.name}</span>
                    <span className="ml-1 text-gray-400 text-xs">{coin.symbol}</span>
                    {WATCHLIST.includes(coin.symbol) && <FaStar className="ml-1 text-yellow-400" />}
                  </td>
                  <td className="py-3 px-4 text-white font-mono font-bold">${coin.price.toLocaleString()}</td>
                  <td className={`py-3 px-4 font-semibold ${coin.change > 0 ? "text-green-400" : "text-red-400"}`}>
                    {coin.change > 0 ? <FaArrowUp className="inline-block" /> : <FaArrowDown className="inline-block" />} {Math.abs(coin.change).toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-gray-300 font-medium">${(coin.cap / 1e9).toFixed(1)}B</td>
                  <td className="py-3 px-4 text-right">
                    <button className="bg-blue-700/80 px-3 py-1 rounded-lg text-white text-xs font-semibold hover:bg-blue-900/80">Trade</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* --- News + Featured Strategies --- */}
        <div className="grid sm:grid-cols-2 gap-5 mt-7">
          {/* News */}
          <section className="bg-[#191e2c] rounded-2xl shadow-md p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <FaFire className="text-orange-400" />
              <span className="text-base text-white font-bold">Market News</span>
            </div>
            {NEWS.map((n, i) => (
              <a key={i} href={n.link} className="text-gray-200 hover:underline font-medium">{n.headline}</a>
            ))}
          </section>
          {/* Strategies */}
          <section className="bg-[#191e2c] rounded-2xl shadow-md p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base text-white font-bold">Featured Strategies</span>
            </div>
            {STRATEGIES.map((s, i) => (
              <div key={i} className="flex flex-col gap-1 mb-2">
                <div className="text-white font-bold">{s.title}</div>
                <div className="text-gray-400 text-sm">{s.desc}</div>
                <a href={s.link} className="text-blue-400 text-xs hover:underline">Learn more</a>
              </div>
            ))}
          </section>
        </div>

        {/* --- Sticky CTA Bar --- */}
        <div className="fixed left-0 right-0 bottom-0 z-30 bg-gradient-to-tr from-[#1a2140]/95 to-[#162042]/95 px-4 py-3 flex justify-between items-center shadow-xl border-t border-blue-900/40 md:hidden">
          <span className="text-white font-bold text-lg">Ready to trade?</span>
          <button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-full font-semibold text-base shadow transition-all">
            Fund Your Account
          </button>
        </div>
      </div>
    </main>
  );
}
