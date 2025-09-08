"use client";
import { useState } from "react";
import { FaCrown, FaChartLine, FaLock, FaDollarSign, FaQuestionCircle } from "react-icons/fa";

const strategiesData = [
  {
    id: 1,
    name: "Dynamic Hedged Arbitrage",
    tag: "Crypto",
    description: "Capture price gaps with minimized risk. Designed for medium-high capital investors.",
    stats: "+17.5% YTD",
    highlight: true,
    chart: "/charts/strat1.png",
  },
  {
    id: 2,
    name: "Cross-Asset Diversification",
    tag: "Mixed",
    description: "Balance crypto, stocks, and metals for smoother, more consistent returns.",
    stats: "+9.8% YTD",
    highlight: false,
    chart: "/charts/strat2.png",
  },
  {
    id: 3,
    name: "Algorithmic Swing Portfolio",
    tag: "Stocks",
    description: "Quant-driven, high-probability trades based on deep technicals and macro signals.",
    stats: "+12.2% YTD",
    highlight: false,
    chart: "/charts/strat3.png",
  },
  {
    id: 4,
    name: "Stable Yield Strategy",
    tag: "Crypto",
    description: "Generate passive income from stablecoins, staking, and lending. Lower volatility.",
    stats: "+7.3% YTD",
    highlight: false,
    chart: "/charts/strat4.png",
  },
  // Add more...
];

const tags = ["All", "Crypto", "Stocks", "Mixed"];

export default function StrategiesPage() {
  const [activeTag, setActiveTag] = useState("All");
  const strategies = activeTag === "All" ? strategiesData : strategiesData.filter(s => s.tag === activeTag);

  return (
    <main className="bg-[#12141c] min-h-screen py-0 px-0">
      {/* Hero */}
      <section className="px-4 pt-7 pb-4 max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-blue-700 to-purple-700 rounded-2xl p-6 mb-7 shadow-lg flex flex-col items-start gap-4">
          <div className="flex items-center gap-2 text-white">
            <FaCrown className="text-yellow-300 text-2xl" />
            <h1 className="text-2xl sm:text-3xl font-bold">
              Advanced Strategies
            </h1>
          </div>
          <p className="text-white/80 max-w-md text-lg">
            Tap into expert-managed, battle-tested strategies to grow, preserve, or protect your wealth. Choose your risk level, diversify easily, and monitor your progress—all in one app.
          </p>
          <button className="mt-2 px-6 py-2 rounded-lg bg-white text-blue-700 font-semibold shadow hover:bg-blue-50 transition">Get Started</button>
        </div>
      </section>

      {/* Filters/Tabs */}
      <section className="max-w-2xl mx-auto px-4 mb-6">
        <div className="flex gap-3 pb-2">
          {tags.map((tag) => (
            <button
              key={tag}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${
                activeTag === tag
                  ? "bg-blue-700 text-white shadow"
                  : "bg-white/10 text-white/70 hover:bg-blue-800/60"
              } transition`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Strategy Cards */}
      <section className="max-w-2xl mx-auto px-4 grid gap-6 mb-14">
        {strategies.map((strat) => (
          <div
            key={strat.id}
            className={`relative rounded-2xl p-5 bg-[#181f2e] shadow-xl border border-[#262b3a]/40 flex flex-col gap-3 overflow-hidden ${
              strat.highlight ? "ring-2 ring-blue-500/60" : ""
            }`}
          >
            {strat.highlight && (
              <span className="absolute top-3 right-3 flex items-center bg-yellow-300 text-blue-800 font-bold text-xs px-2 py-0.5 rounded">
                <FaCrown className="mr-1 text-yellow-400" />
                Featured
              </span>
            )}
            <div className="flex items-center gap-3 mb-1">
              <div className="text-blue-500/80 bg-blue-900/60 rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wider">{strat.tag}</div>
              <span className="text-green-400 text-xs font-mono bg-green-900/10 px-2 py-1 rounded">{strat.stats}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1 flex items-center gap-2">
              <FaChartLine className="inline text-blue-400" /> {strat.name}
            </h2>
            <p className="text-white/80 mb-2">{strat.description}</p>
            {/* Chart thumbnail */}
            <img
              src={strat.chart}
              alt="Strategy Chart"
              className="w-full h-[72px] object-contain rounded bg-[#151b29] mb-1"
            />
            <div className="flex gap-2 mt-2">
              <button className="bg-blue-700 hover:bg-blue-800 text-white text-sm px-4 py-1.5 rounded font-semibold transition">View Details</button>
              <button className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-1.5 rounded font-semibold">Simulate</button>
            </div>
          </div>
        ))}
      </section>

      {/* FAQ or Compare Table (Optional) */}
      <section className="max-w-2xl mx-auto px-4 mb-24">
        <details className="bg-[#181f2e] p-4 rounded-lg mb-2">
          <summary className="text-white font-semibold flex items-center gap-2 cursor-pointer">
            <FaQuestionCircle /> What is a managed strategy?
          </summary>
          <p className="text-white/70 mt-2 text-sm">
            A managed strategy is an investment approach where an expert (or algorithm) handles all the trades, balancing risk and opportunity, so you don’t have to.
          </p>
        </details>
      </section>
    </main>
  );
}
