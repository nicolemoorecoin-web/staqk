// src/app/home/components/TopStocksChart.js
"use client";
const TOP_STOCKS = [
  {
    symbol: "AAPL",
    name: "Apple",
    value: 210,
    color: "#222222",
    logo: "/stocks/aapl.svg"
  },
  {
    symbol: "TSLA",
    name: "Tesla",
    value: 250,
    color: "#e2241a",
    logo: "/stocks/tsla.svg"
  },
  {
    symbol: "AMZN",
    name: "Amazon",
    value: 200,
    color: "#30445b",
    logo: "/stocks/amzn.svg"
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    value: 160,
    color: "#69be28",
    logo: "/stocks/msft.svg"
  },
  {
    symbol: "GOOG",
    name: "Google",
    value: 150,
    color: "#4094f7",
    logo: "/stocks/goog.svg"
  },
];

export default function TopStocksChart() {
  // Get max value for proportional bar heights
  const max = Math.max(...TOP_STOCKS.map(s => s.value));
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 bg-[#1b2030] rounded-2xl p-6 shadow-2xl">
      <h3 className="text-lg text-white font-bold mb-5">Top Stocks</h3>
      <div className="flex items-end justify-between gap-4 h-52 pb-6">
        {TOP_STOCKS.map(stock => (
          <div key={stock.symbol} className="flex flex-col items-center w-1/5">
            <div
              className="w-12 rounded-t-xl flex items-end justify-center relative"
              style={{
                height: `${(stock.value / max) * 160 + 40}px`, // proportional
                background: stock.color
              }}>
              <img
                src={stock.logo}
                alt={stock.name}
                className="absolute -top-10 left-1/2 -translate-x-1/2 w-9 h-9 bg-white rounded-full shadow"
              />
            </div>
            <span className="text-xs mt-2 text-white font-semibold">{stock.symbol}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-3 px-1">
        {TOP_STOCKS.map(stock => (
          <span key={stock.symbol} className="text-xs text-gray-400 w-1/5 text-center truncate">{stock.name}</span>
        ))}
      </div>
    </div>
  );
}
