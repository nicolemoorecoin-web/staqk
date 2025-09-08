"use client";
import { useState, useEffect } from "react";
import {
  FaStar, FaRegStar, FaArrowUp, FaArrowDown, FaSearch, FaFire,
  FaChevronDown, FaChevronUp, FaChartLine, FaEye, FaPlus, FaExchangeAlt
} from "react-icons/fa";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
// ❌ remove broken store import — page doesn't use it
// import { useWalletStore } from "../..lib/walletStore";

// --- DEMO DATA ---
const COINS = [
  { symbol: "BTC", name: "Bitcoin", price: 68310, change: 2.1, cap: 1340000000000, icon: "/crypto/btc.svg",
    history: [64000, 65800, 66500, 67200, 67400, 68000, 68310], holdings: 0.12, avg: 65000 },
  { symbol: "ETH", name: "Ethereum", price: 3625, change: -1.4, cap: 426000000000, icon: "/crypto/eth.svg",
    history: [3500, 3600, 3570, 3700, 3650, 3630, 3625], holdings: 4.5, avg: 2990 },
  { symbol: "SOL", name: "Solana", price: 152, change: 5.2, cap: 67000000000, icon: "/crypto/sol.svg",
    history: [142, 146, 145, 148, 150, 151, 152], holdings: 12.8, avg: 92 },
  { symbol: "BNB", name: "Binance Coin", price: 612, change: 3.7, cap: 98400000000, icon: "/crypto/bnb.svg",
    history: [580, 592, 600, 605, 610, 611, 612], holdings: 0.6, avg: 410 },
  { symbol: "ADA", name: "Cardano", price: 0.432, change: -0.6, cap: 15000000000, icon: "/crypto/ada.svg",
    history: [0.42, 0.41, 0.43, 0.44, 0.435, 0.433, 0.432], holdings: 1800, avg: 0.28 },
  { symbol: "XRP", name: "Ripple", price: 0.57, change: 0.8, cap: 22100000000, icon: "/crypto/xrp.svg",
    history: [0.53, 0.54, 0.55, 0.59, 0.6, 0.58, 0.57], holdings: 730, avg: 0.6 },
  { symbol: "DOGE", name: "Dogecoin", price: 0.158, change: -1.4, cap: 22600000000, icon: "/crypto/doge.svg",
    history: [0.16, 0.162, 0.161, 0.165, 0.16, 0.159, 0.158], holdings: 4200, avg: 0.09 },
  { symbol: "LINK", name: "Chainlink", price: 18.5, change: 3.2, cap: 10200000000, icon: "/crypto/link.svg",
    history: [17, 17.7, 18.2, 18.9, 18.7, 18.5, 18.5], holdings: 90, avg: 8.2 },
  { symbol: "DOT", name: "Polkadot", price: 6.27, change: -1.8, cap: 8400000000, icon: "/crypto/dot.svg",
    history: [5.8, 6.2, 6.1, 6.3, 6.4, 6.3, 6.27], holdings: 250, avg: 4.5 },
];

const DEMO_NEWS = [
  { headline: "Bitcoin rebounds after Fed signals rate pause", link: "#" },
  { headline: "Ethereum Dencun upgrade launches", link: "#" },
  { headline: "AI tokens outperform, DeFi TVL at new high", link: "#" },
];
const DEMO_STRATEGIES = [
  { title: "AI-Powered Swing", desc: "Machine learning for smarter trading.", link: "#" },
  { title: "Yield Farming Pro", desc: "Auto-rotate to top APY pools.", link: "#" },
];

export default function MarketPage() {
  // ---- State ----
  const [coins, setCoins] = useState(COINS);
  const [tab, setTab] = useState("Market");
  const [sortKey, setSortKey] = useState("cap");
  const [sortDir, setSortDir] = useState("desc");
  const [query, setQuery] = useState("");
  const [watchlist, setWatchlist] = useState(["BTC", "ETH", "SOL"]);

  // ---- LIVE PRICE FETCH ----
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const symbols = COINS.map(c => c.symbol).join(",");
        const res = await fetch(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${symbols}&tsyms=USD`);
        const json = await res.json();

        const updatedCoins = COINS.map(coin => {
          const coinData = json.RAW?.[coin.symbol]?.USD;
          if (!coinData) return coin;
          return {
            ...coin,
            price: coinData.PRICE,
            change: coinData.CHANGEPCT24HOUR,
          };
        });

        setCoins(updatedCoins);
      } catch (err) {
        console.error("Live price fetch failed:", err);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  // ---- Table Data (sorts, filters, tabs) ----
  let data = [...coins];
  if (tab === "Watchlist") data = data.filter((c) => watchlist.includes(c.symbol));
  if (tab === "Top Gainers") data = data.sort((a, b) => b.change - a.change).slice(0, 5);
  if (tab === "Top Losers") data = data.sort((a, b) => a.change - b.change).slice(0, 5);
  if (tab === "Market" && query) {
    data = data.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.symbol.toLowerCase().includes(query.toLowerCase())
    );
  }
  data = data.sort((a, b) => {
    if (sortKey === "name") return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    if (sortDir === "asc") return a[sortKey] - b[sortKey];
    return b[sortKey] - a[sortKey];
  });

  function toggleStar(symbol) {
    setWatchlist((wl) => (wl.includes(symbol) ? wl.filter((s) => s !== symbol) : [...wl, symbol]));
  }

  function holdingsValue(coin) {
    if (!coin.holdings) return null;
    const curr = coin.price * coin.holdings;
    const cost = coin.avg * coin.holdings;
    const pnl = curr - cost;
    return { value: curr, pnl, percent: cost === 0 ? 0 : (pnl / cost) * 100 };
  }

  function TableHeader({ label, keyName }) {
    return (
      <th
        onClick={() => {
          if (sortKey === keyName) setSortDir(sortDir === "asc" ? "desc" : "asc");
          setSortKey(keyName);
        }}
        className={`py-3 px-3 text-gray-400 text-xs font-bold cursor-pointer select-none hover:text-white ${sortKey === keyName ? "underline" : ""}`}
      >
        {label}{" "}
        {sortKey === keyName && (sortDir === "asc" ? <FaChevronUp className="inline-block" /> : <FaChevronDown className="inline-block" />)}
      </th>
    );
  }

  return (
    <main className="bg-[#10141c] min-h-screen pb-32 font-sans">
      <div className="max-w-6xl mx-auto px-2 sm:px-6 pt-8">
        {/* Banner Tickers */}
        <section className="rounded-3xl bg-gradient-to-br from-[#171d2d]/80 to-[#222749]/90 shadow-2xl px-6 py-5 mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <FaFire className="text-orange-400 animate-pulse" />
            <span className="text-lg text-white font-bold tracking-wide">Live Market Overview</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {coins.slice(0, 7).map((c) => (
              <div key={c.symbol} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#181d2b] shadow-md">
                <img src={c.icon} alt={c.symbol} className="w-6 h-6" />
                <span className="text-white font-medium">{c.symbol}</span>
                <span className="text-gray-400">${c.price?.toLocaleString?.() ?? c.price}</span>
                <span className={c.change > 0 ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                  {c.change > 0 ? <FaArrowUp className="inline-block" /> : <FaArrowDown className="inline-block" />} {Math.abs(Number(c.change)).toFixed(2)}%
                </span>
                <span className="w-16 h-6"><MicroChart data={c.history} up={c.change > 0} /></span>
              </div>
            ))}
          </div>
        </section>

        {/* Tabs & Search */}
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

        {/* Table */}
        <section className="rounded-2xl bg-[#181d2b]/90 shadow-lg overflow-x-auto">
          <table className="w-full text-left min-w-[950px]">
            <thead>
              <tr className="border-b border-blue-900/50">
                <TableHeader label="#" keyName="rank" />
                <TableHeader label="Asset" keyName="name" />
                <TableHeader label="Price" keyName="price" />
                <TableHeader label="24h %" keyName="change" />
                <th className="py-3 px-3 text-gray-400 text-xs font-bold">Chart</th>
                <TableHeader label="Market Cap" keyName="cap" />
                <th className="py-3 px-3 text-gray-400 text-xs font-bold">Favorite</th>
                <th className="py-3 px-3 text-gray-400 text-xs font-bold">My Holdings</th>
                <th className="py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((coin, i) => (
                <tr key={coin.symbol} className="border-b border-blue-900/20 hover:bg-blue-900/10 transition">
                  <td className="py-3 px-3 text-xs text-gray-500">{i + 1}</td>
                  <td className="py-3 px-3 flex items-center gap-2">
                    <img src={coin.icon} className="w-6 h-6" alt={coin.symbol} />
                    <span className="text-white font-medium">{coin.name}</span>
                    <span className="ml-1 text-gray-400 text-xs">{coin.symbol}</span>
                  </td>
                  <td className="py-3 px-3 text-white font-mono font-bold">${coin.price?.toLocaleString?.() ?? coin.price}</td>
                  <td className={`py-3 px-3 font-semibold ${coin.change > 0 ? "text-green-400" : "text-red-400"}`}>
                    {coin.change > 0 ? <FaArrowUp className="inline-block" /> : <FaArrowDown className="inline-block" />} {Math.abs(Number(coin.change)).toFixed(2)}%
                  </td>
                  <td className="py-3 px-3 w-20">
                    <MicroChart data={coin.history} up={coin.change > 0} />
                  </td>
                  <td className="py-3 px-3 text-gray-300 font-medium">${(coin.cap / 1e9).toFixed(1)}B</td>
                  <td className="py-3 px-3 text-center">
                    <button onClick={() => toggleStar(coin.symbol)}>
                      {watchlist.includes(coin.symbol) ? (
                        <FaStar className="text-yellow-400 text-lg" />
                      ) : (
                        <FaRegStar className="text-gray-500 text-lg" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right min-w-[160px]">
                    {coin.holdings ? (
                      <div>
                        <div className="text-white text-sm font-bold flex items-center gap-1">
                          {coin.holdings} <span className="text-gray-500">{coin.symbol}</span>
                        </div>
                        <div className={`text-xs ${holdingsValue(coin).pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {holdingsValue(coin).pnl >= 0 ? "+" : ""}
                          {holdingsValue(coin).pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({holdingsValue(coin).percent.toFixed(2)}%)
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button className="bg-blue-700/80 px-3 py-1 rounded-lg text-white text-xs font-semibold hover:bg-blue-900/80 flex items-center gap-1">
                      <FaExchangeAlt /> Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* News + Strategies */}
        <div className="grid sm:grid-cols-2 gap-5 mt-8">
          <section className="bg-[#191e2c] rounded-2xl shadow-md p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <FaFire className="text-orange-400" />
              <span className="text-base text-white font-bold">Market News</span>
            </div>
            {DEMO_NEWS.map((n, i) => (
              <a key={i} href={n.link} className="text-gray-200 hover:underline font-medium">{n.headline}</a>
            ))}
          </section>
          <section className="bg-[#191e2c] rounded-2xl shadow-md p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base text-white font-bold">Featured Strategies</span>
            </div>
            {DEMO_STRATEGIES.map((s, i) => (
              <div key={i} className="flex flex-col gap-1 mb-2">
                <div className="text-white font-bold">{s.title}</div>
                <div className="text-gray-400 text-sm">{s.desc}</div>
                <a href={s.link} className="text-blue-400 text-xs hover:underline">Learn more</a>
              </div>
            ))}
          </section>
        </div>

        {/* Sticky CTA Bar */}
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

// --- MicroChart component (Sparklines) ---
function MicroChart({ data, up }) {
  const lineData = data.map((v, i) => ({ value: v, i }));
  return (
    <ResponsiveContainer width="100%" height={30}>
      <LineChart data={lineData}>
        <Line type="monotone" dataKey="value" stroke={up ? "#19e07f" : "#e84f4f"} strokeWidth={2} dot={false} />
        <Tooltip content={<></>} />
      </LineChart>
    </ResponsiveContainer>
  );
}
