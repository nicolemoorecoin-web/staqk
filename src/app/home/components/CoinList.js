"use client";
import { useMemo, useState } from "react";
import useCryptoWS from "./useCryptoWS"; // 👈 must sit in the same folder

// Use your existing /public/crypto icons
const COIN_ICONS = {
  BTC: "/crypto/btc.svg",
  BCH: "/crypto/bch.svg",
  ETH: "/crypto/eth.svg",
  XRP: "/crypto/xrp.svg",
  BNB: "/crypto/bnb.svg",
  SOL: "/crypto/sol.svg",
  DOGE: "/crypto/doge.svg",
  ADA: "/crypto/ada.svg",
  PEPE: "/crypto/pepe.png",
  AVAX: "/crypto/avax.svg",
  MATIC: "/crypto/matic.svg",
  SHIB: "/crypto/shib.svg",
  DOT: "/crypto/dot.svg",
  UNI: "/crypto/uni.svg",
  TRX: "/crypto/trx.svg",
};

// Static seed (names/icons); live prices will override
const ALL_COINS = [
  { symbol: "BTC", name: "Bitcoin",  price: 114651.15, change: 1.47 },
  { symbol: "BCH", name: "Bitcoin Cash", price: 549.3, change: 4.77 },
  { symbol: "ETH", name: "Ethereum", price: 3537.66, change: 3.74 },
  { symbol: "XRP", name: "XRP", price: 3.01, change: 8.33 },
  { symbol: "BNB", name: "BNB", price: 756.4, change: 2.33 },
  { symbol: "SOL", name: "Solana", price: 163.46, change: 2.09 },
  { symbol: "DOGE", name: "Dogecoin", price: 0.20151, change: 3.19 },
  { symbol: "ADA", name: "Cardano", price: 0.421, change: 1.67 },
  { symbol: "PEPE", name: "Pepe", price: 0.00001054, change: 2.73 },
  { symbol: "AVAX", name: "Avalanche", price: 29.11, change: 5.18 },
  { symbol: "MATIC", name: "Polygon", price: 0.82, change: 1.28 },
  { symbol: "SHIB", name: "Shiba Inu", price: 0.000025, change: 1.95 },
  { symbol: "DOT", name: "Polkadot", price: 6.17, change: 2.55 },
  { symbol: "UNI", name: "Uniswap", price: 7.22, change: 2.99 },
  { symbol: "TRX", name: "TRON", price: 0.124, change: 1.34 },
];

// Your demo watchlist (symbols)
const WATCHLIST = ["BTC", "ETH", "XRP"];

function mergeLive(base, liveMap) {
  return base.map((c) => {
    const live = liveMap[c.symbol];
    return live
      ? { ...c, price: live.price ?? c.price, change: live.changePct24h ?? c.change }
      : c;
  });
}

export default function CoinList() {
  const [activeTab, setActiveTab] = useState("watchlist"); // "watchlist" | "coin"
  const [sortBy, setSortBy] = useState("change"); // "price" | "change"
  const [sortDir, setSortDir] = useState("desc");

  // Subscribe to all symbols we show
  const symbols = useMemo(() => ALL_COINS.map((c) => c.symbol), []);
  const live = useCryptoWS(symbols); // { BTC:{price,changePct24h}, ... }

  const view = activeTab === "watchlist"
    ? ALL_COINS.filter((c) => WATCHLIST.includes(c.symbol))
    : ALL_COINS;

  const merged = useMemo(() => mergeLive(view, live), [view, live]);

  const sorted = useMemo(() => {
    const arr = [...merged];
    arr.sort((a, b) => {
      const A = a[sortBy] ?? 0;
      const B = b[sortBy] ?? 0;
      return sortDir === "desc" ? B - A : A - B;
    });
    return arr;
  }, [merged, sortBy, sortDir]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("desc"); }
  };

  return (
    <section className="px-4 mt-6">
      <div className="max-w-xl mx-auto bg-[#151a28] rounded-2xl border border-blue-900/30 shadow-xl overflow-hidden">
        {/* Header / Tabs */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#101627] to-[#0f1424]">
          <div className="flex gap-6">
            <button
              className={`text-lg font-bold pb-1 border-b-2 transition ${
                activeTab === "coin" ? "text-white border-blue-500" : "text-gray-400 border-transparent"
              }`}
              onClick={() => setActiveTab("coin")}
            >
              Coin
            </button>
            <button
              className={`text-lg font-bold pb-1 border-b-2 transition ${
                activeTab === "watchlist" ? "text-white border-blue-500" : "text-gray-400 border-transparent"
              }`}
              onClick={() => setActiveTab("watchlist")}
            >
              Watchlist
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400">
            <span className="bg-[#1f2540] px-2 py-0.5 rounded-md font-bold">24h</span>
            <span className="opacity-70">Live</span>
          </div>
        </div>

        {/* Table header */}
        <div className="flex items-center px-4 py-2 text-gray-400 text-sm font-semibold">
          <div className="flex-1">Coin</div>
          <button className="w-28 text-right hover:text-white" onClick={() => toggleSort("change")}>
            24 hours {sortBy === "change" && (sortDir === "desc" ? "▼" : "▲")}
          </button>
          <button className="w-36 text-right hover:text-white" onClick={() => toggleSort("price")}>
            Price {sortBy === "price" && (sortDir === "desc" ? "▼" : "▲")}
          </button>
        </div>

        {/* Rows */}
        <div className="divide-y divide-blue-900/20">
          {sorted.map((coin) => {
            const up = (coin.change ?? 0) >= 0;
            return (
              <div key={coin.symbol} className="flex items-center px-4 py-3 hover:bg-[#11182c] transition">
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <img
                    src={COIN_ICONS[coin.symbol] || "/crypto/default.svg"}
                    alt={coin.symbol}
                    className="w-8 h-8 rounded-full bg-[#1b2135] object-contain"
                  />
                  <div className="truncate">
                    <div className="text-white font-semibold truncate">{coin.name}</div>
                    <div className="text-xs text-gray-400">{coin.symbol}</div>
                  </div>
                </div>
                <div className={`w-28 text-right font-bold ${up ? "text-green-400" : "text-red-400"}`}>
                  {up ? "+" : ""}{Math.abs(coin.change ?? 0).toFixed(2)}%
                </div>
                <div className="w-36 text-right text-gray-100 font-bold">
                  ${Number(coin.price ?? 0).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
