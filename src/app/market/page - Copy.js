"use client";
import React, { useEffect, useState } from "react";
import { Sparklines, SparklinesLine } from "react-sparklines";

// ====== COINS DATA FOR LIVE PRICES ======
const COINS = [
  { symbol: "BTC", name: "Bitcoin", icon: "/crypto/btc.svg" },
  { symbol: "ETH", name: "Ethereum", icon: "/crypto/eth.svg" },
  { symbol: "XRP", name: "XRP", icon: "/crypto/xrp.svg" },
  { symbol: "LTC", name: "Litecoin", icon: "/crypto/ltc.svg" },
  { symbol: "USDT", name: "Tether", icon: "/crypto/usdt.svg" },
];

// ====== SPARKLINE DEMO DATA ======
const priceHistory = {
  BTC: [64000, 64100, 64050, 64200, 64150, 64250, 64300],
  ETH: [3200, 3210, 3198, 3225, 3220, 3218, 3200],
  XRP: [0.58, 0.59, 0.58, 0.582, 0.581, 0.585, 0.58],
  LTC: [88, 88.1, 88.3, 88.8, 88.7, 88.5, 88],
  USDT: [1.0, 1.0, 1.001, 1.0005, 0.999, 1.0, 1.0]
};

// ====== 1. LIVE PRICES ======
function LivePrices() {
  const [prices, setPrices] = useState({});
  useEffect(() => {
    function fetchPrices() {
      const symbols = COINS.map((c) => c.symbol).join(",");
      fetch(
        `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${symbols}&tsyms=USD`
      )
        .then((res) => res.json())
        .then((data) => setPrices(data.RAW));
    }
    fetchPrices();
    const interval = setInterval(fetchPrices, 12000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="ticker-grid">
      {COINS.map((coin) => {
        const price = prices[coin.symbol]?.USD?.PRICE;
        const change = prices[coin.symbol]?.USD?.CHANGEPCT24HOUR;
        const isUp = change >= 0;
        return (
          <a key={coin.symbol} className="ticker-card" href="#">
            <img src={coin.icon} alt={coin.symbol} className="ticker-icon" />
            <div className="ticker-labels">
              <span className="ticker-symbol">{coin.symbol}</span>
              <span className="ticker-name">{coin.name}</span>
            </div>
            <div className="ticker-price">
              ${price ? price.toLocaleString(undefined, { maximumFractionDigits: 3 }) : "--"}
            </div>
            <div className={`ticker-change ${isUp ? "up" : "down"}`}>
              {change ? (isUp ? "▲" : "▼") : ""} {change ? change.toFixed(2) : "--"}%
            </div>
            <div className="ticker-sparkline">
              <Sparklines data={priceHistory[coin.symbol]} width={80} height={28}>
                <SparklinesLine color={isUp ? "#19e07f" : "#e84f4f"} style={{ strokeWidth: 2, fill: "none" }} />
              </Sparklines>
            </div>
          </a>
        );
      })}
    </div>
  );
}

// ====== 2. ADVANCED WATCHLIST ======
function AdvancedWatchlist() {
  const ALL_PAIRS = [
    { pair: "BTC/USDT", icon: "/crypto/btc.svg", price: 64100, change: 1.7 },
    { pair: "ETH/USDT", icon: "/crypto/eth.svg", price: 3210, change: 1.2 },
    { pair: "ADA/USDT", icon: "/crypto/ada.svg", price: 0.456, change: -0.4 },
    { pair: "XRP/USDT", icon: "/crypto/xrp.svg", price: 0.583, change: 0.8 },
    { pair: "LTC/USDT", icon: "/crypto/ltc.svg", price: 88.2, change: -0.3 },
    { pair: "EUR/USD", icon: "/crypto/eurusd.svg", price: 1.0821, change: 0.2 },
  ];
  const [watchlist, setWatchlist] = useState(["BTC/USDT", "ETH/USDT", "ADA/USDT"]);
  const [search, setSearch] = useState("");
  function toggle(pair) {
    setWatchlist(w =>
      w.includes(pair) ? w.filter(p => p !== pair) : [...w, pair]
    );
  }
  const filtered = ALL_PAIRS.filter(
    p =>
      p.pair.toLowerCase().includes(search.toLowerCase()) ||
      !search
  );
  return (
    <div className="watchlist-section-adv">
      <div className="watchlist-bar">
        <input
          type="text"
          placeholder="Search pairs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="watchlist-search"
        />
      </div>
      <div className="watchlist-table-wrapper">
        <table className="watchlist-table">
          <thead>
            <tr>
              <th></th>
              <th>Pair</th>
              <th>Price</th>
              <th>24h</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.pair} className={watchlist.includes(item.pair) ? "favorite" : ""}>
                <td>
                  <span
                    className={`star-toggle ${watchlist.includes(item.pair) ? "active" : ""}`}
                    title={watchlist.includes(item.pair) ? "Remove from Watchlist" : "Add to Watchlist"}
                    onClick={() => toggle(item.pair)}
                  >★</span>
                </td>
                <td className="pair-col">
                  <img src={item.icon} alt={item.pair} className="pair-icon" />
                  {item.pair}
                </td>
                <td>${item.price}</td>
                <td className={item.change >= 0 ? "up" : "down"}>
                  {item.change >= 0 ? "+" : ""}
                  {item.change}%
                </td>
                <td>
                  <button className="view-btn">View</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "#888" }}>No pairs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ====== 3. MARKET NEWS ======
function MarketNews() {
  // Demo news data (replace with live API later)
  const news = [
    {
      title: "BTC rebounds above $64K after CPI report",
      summary: "Bitcoin surged back above $64,000 after the latest U.S. CPI numbers showed slowing inflation. Analysts say this could signal renewed bullishness.",
      source: "CoinDesk",
      sourceLogo: "/news/coindesk.png",
      time: "2h ago",
      link: "#"
    },
    {
      title: "Ethereum upgrade drives 5% rally",
      summary: "ETH led altcoins with a 5% jump after developers activated the long-awaited protocol upgrade. Gas fees have dropped 40%.",
      source: "The Block",
      sourceLogo: "/news/theblock.png",
      time: "3h ago",
      link: "#"
    },
    {
      title: "Market Outlook: Crypto consolidation likely before next breakout",
      summary: "Markets are expected to trade sideways for several days. Watch for volatility around next week’s Fed meeting.",
      source: "Crypto Briefing",
      sourceLogo: "/news/cryptobriefing.png",
      time: "1h ago",
      link: "#"
    }
  ];
  return (
    <div className="market-news-grid">
      {news.map((n, i) => (
        <div className="market-news-card" key={i}>
          <div className="market-news-source">
            <img src={n.sourceLogo} alt={n.source} className="market-news-logo" />
            <span className="market-news-source-name">{n.source}</span>
            <span className="market-news-time">{n.time}</span>
          </div>
          <div className="market-news-title">{n.title}</div>
          <div className="market-news-summary">{n.summary}</div>
          <a href={n.link} className="market-news-link" target="_blank" rel="noopener noreferrer">
            Read more
          </a>
        </div>
      ))}
    </div>
  );
}

// ====== 4. STRATEGY HIGHLIGHTS ======
function Strategies() {
  const strategies = [
    {
      title: "Dynamic Hedged Arbitrage",
      desc: "Capture pricing gaps with reduced risk using multi-asset, multi-exchange monitoring. Ideal for $15K+ portfolios.",
      icon: "/strategies/arbitrage.svg",
      link: "#"
    },
    {
      title: "Cross-Asset Diversification",
      desc: "Balance crypto, forex, and metals for smooth, consistent returns with dynamic allocation.",
      icon: "/strategies/diversification.svg",
      link: "#"
    },
    {
      title: "Algorithmic Swing Portfolio",
      desc: "Quant-driven, high-probability moves—let our algorithms capture the market’s best swings.",
      icon: "/strategies/swing.svg",
      link: "#"
    },
    {
      title: "AI-Driven Momentum",
      desc: "Let our AI models spot and ride the hottest trends across global markets.",
      icon: "/strategies/ai.svg",
      link: "#"
    }
  ];
  return (
    <div className="strategy-grid">
      {strategies.map((s, i) => (
        <div className="strategy-pro-card" key={i}>
          <img src={s.icon} alt="" className="strategy-icon" />
          <div className="strategy-pro-title">{s.title}</div>
          <div className="strategy-pro-desc">{s.desc}</div>
          <a href={s.link} className="strategy-learn-btn">Learn More</a>
        </div>
      ))}
    </div>
  );
}

// ====== 5. SIGNALS ======
function TradeIdeas() {
  // Demo trade ideas; replace/fetch from API for live signals
  const ideas = [
    {
      type: "BUY",
      pair: "ETH/USD",
      price: "Above $3,250",
      target: "$3,400",
      stop: "$3,150",
      analyst: "AI SignalBot",
      avatar: "/signals/ai.png",
      updated: "3m ago",
    },
    {
      type: "SHORT",
      pair: "BTC/USD",
      price: "Below $63,500",
      target: "$61,800",
      stop: "$64,200",
      analyst: "Sophie",
      avatar: "/signals/sophie.png",
      updated: "7m ago",
    },
    {
      type: "BUY",
      pair: "ADA/USDT",
      price: "Above $0.52",
      target: "$0.57",
      stop: "$0.495",
      analyst: "Cody",
      avatar: "/signals/cody.png",
      updated: "10m ago",
    },
  ];
  return (
    <div className="trade-ideas-grid">
      {ideas.map((idea, i) => (
        <div className={`trade-idea-card ${idea.type.toLowerCase()}`} key={i}>
          <div className="trade-idea-header">
            <span className={`trade-type-badge ${idea.type.toLowerCase()}`}>
              {idea.type}
            </span>
            <span className="trade-idea-pair">{idea.pair}</span>
            <span className="trade-idea-updated">{idea.updated}</span>
          </div>
          <div className="trade-idea-details">
            <div>
              <b>Trigger:</b> <span>{idea.price}</span>
            </div>
            <div>
              <b>Target:</b> <span>{idea.target}</span>
            </div>
            <div>
              <b>Stop:</b> <span>{idea.stop}</span>
            </div>
          </div>
          <div className="trade-idea-analyst">
            <img src={idea.avatar} alt={idea.analyst} className="analyst-avatar" />
            <span>{idea.analyst}</span>
          </div>
        </div>
      ))}
      <div className="trade-idea-disclaimer">
        <b>Disclaimer:</b> These trade ideas are for educational purposes only, not investment advice.
      </div>
    </div>
  );
}


// ====== 6. MARKET SUMMARY ======
function MarketSummary() {
  const summary = [
    { pair: "BTC/USD", price: "64,100", change: 2.1 },
    { pair: "ETH/USD", price: "3,200", change: 1.8 },
    { pair: "XRP/USD", price: "0.58", change: 0.9 },
    { pair: "ADA/USD", price: "0.456", change: -0.8 },
    { pair: "LTC/USD", price: "88.2", change: -0.3 },
  ];
  return (
    <div className="market-summary-table-wrap">
      <table className="market-summary-table">
        <thead>
          <tr>
            <th>Pair</th>
            <th>Price</th>
            <th>24h Change</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((s, i) => (
            <tr key={i}>
              <td>{s.pair}</td>
              <td>${s.price}</td>
              <td className={s.change >= 0 ? "up" : "down"}>
                {s.change >= 0 ? "+" : ""}
                {s.change}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
// ====== MAIN MARKET PAGE ======
export default function MarketPage() {
  return (
    <div className="market-page">
      {/* 1. Live Prices / Tickers */}
      <section className="market-tickers-section">
        <h2 className="section-title">Live Prices</h2>
        <LivePrices />
      </section>
      {/* 2. Advanced Watchlist */}
      <section className="market-watchlist-section">
        <h2 className="section-title">Your Watchlist</h2>
        <AdvancedWatchlist />
      </section>
      {/* 3. Market News & Research */}
      <section className="market-news-section">
        <h2 className="section-title">Market News</h2>
        <MarketNews />
      </section>
      {/* 4. Strategy Highlights */}
      <section className="market-strategy-section">
        <h2 className="section-title">Featured Strategies</h2>
        <Strategies />
      </section>
      {/* 5. Signals / Trade Ideas */}
      <section className="market-signals-section">
        <h2 className="section-title">Trade Ideas</h2>
        <TradeIdeas />
      </section>
      {/* 6. Market Summary / Heatmap */}
      <section className="market-summary-section">
        <h2 className="section-title">Market Summary</h2>
        <MarketSummary />
      </section>
      {/* 7. Call to Action */}
      <section className="market-cta-section">
        <button className="cta-btn fund-btn">Fund Your Account</button>
        <button className="cta-btn learn-btn">Learn About Managed Accounts</button>
      </section>
    </div>
  );
}
