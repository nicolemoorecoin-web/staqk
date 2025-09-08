"use client";
import useCryptoWS from "./useCryptoWS";

export default function LivePriceBar() {
  const live = useCryptoWS(["BTC","ETH","SOL","BNB","ADA","XRP","DOGE"]);
  const entries = Object.entries(live);

  if (!entries.length) {
    return (
      <div className="px-4 py-3 bg-[#181d2b] rounded-xl text-gray-300 border border-blue-900/40">
        Connecting to live prices… (check console)
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 py-2 bg-[#181d2b] rounded-xl">
      {entries.map(([sym, v]) => {
        const price = v?.price ?? 0;
        const pct = Number.isFinite(v?.changePct24h) ? v.changePct24h : 0;
        const up = pct >= 0;

        return (
          <div
            key={sym}
            className="flex items-center gap-2 bg-[#121829] px-3 py-2 rounded-lg shrink-0 border border-blue-900/30"
          >
            <span className="text-white font-semibold">{sym}</span>
            <span className="text-gray-300">${price.toLocaleString()}</span>
            <span
              className={`${up ? "text-green-400" : "text-red-400"} font-bold`}
            >
              {up ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}