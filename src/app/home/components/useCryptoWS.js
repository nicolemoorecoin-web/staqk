"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Live crypto prices with resilient fallbacks.
 * - CoinCap WS streams live USD prices
 * - CoinGecko REST seeds prices + 24h change and refreshes them every 60s
 * Works even if websockets are blocked.
 */
export default function useCryptoWS(symbols = ["BTC","ETH","SOL","BNB","ADA","XRP","DOGE"]) {
  const [data, setData] = useState({});
  const wsRef = useRef(null);

  // map symbol <-> CoinCap/Coingecko ids
  const ccIds = {
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana",
    BNB: "binance-coin",
    ADA: "cardano",
    XRP: "ripple",
    DOGE: "dogecoin",
  };

  // ---- Seed with CoinGecko so UI shows quickly ----
  async function seedFromCoingecko() {
    const ids = symbols.map(s => ccIds[s]).filter(Boolean).join(",");
    if (!ids) return;
    try {
      const r = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
        { cache: "no-store" }
      );
      const j = await r.json();
      const next = {};
      for (const sym of symbols) {
        const id = ccIds[sym];
        if (!id || !j[id]) continue;
        next[sym] = {
          price: Number(j[id].usd),
          changePct24h: Number(j[id].usd_24h_change),
        };
      }
      if (Object.keys(next).length) setData(prev => ({ ...prev, ...next }));
    } catch (_) { /* ignore */ }
  }

  // ---- Live WS (CoinCap) for price stream ----
  function startCoinCapWS() {
    const assets = symbols.map(s => ccIds[s]).filter(Boolean).join(",");
    if (!assets) return;

    const url = `wss://ws.coincap.io/prices?assets=${assets}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => { /* connected */ };
    ws.onmessage = (evt) => {
      // evt.data like: {"bitcoin":"68432.12","ethereum":"3620.55"}
      const obj = JSON.parse(evt.data);
      const next = {};
      for (const [id, px] of Object.entries(obj)) {
        const sym = Object.keys(ccIds).find(k => ccIds[k] === id);
        if (!sym) continue;
        next[sym] = {
          // keep last % change, update price
          price: Number(px),
          changePct24h: data[sym]?.changePct24h ?? 0,
        };
      }
      if (Object.keys(next).length) setData(prev => ({ ...prev, ...next }));
    };
    ws.onerror = () => { try { ws.close(); } catch {} };
  }

  useEffect(() => {
    let timerPct;
    seedFromCoingecko();           // immediate seed
    startCoinCapWS();              // start live price stream
    // refresh 24h % periodically so it stays accurate
    timerPct = setInterval(seedFromCoingecko, 60000);

    return () => {
      clearInterval(timerPct);
      try { wsRef.current?.close(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(",")]);

  return data; // { BTC: {price, changePct24h}, ... }
}
