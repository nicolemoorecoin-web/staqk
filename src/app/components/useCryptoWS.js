"use client";
import { useEffect, useRef, useState } from "react";

/** Live prices from Binance WS for symbols like ['BTC','ETH'] (USDT pairs). */
export default function useCryptoWS(symbols = ["BTC","ETH","SOL"]) {
  const [prices, setPrices] = useState({});
  const wsRef = useRef(null);

  useEffect(() => {
    if (!symbols.length) return;

    const streams = symbols.map(s => `${s.toLowerCase()}usdt@ticker`).join("/");
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      const payload = JSON.parse(evt.data);
      const t = payload?.data;
      if (!t?.s) return;
      const sym = t.s.replace("USDT", "");
      setPrices(prev => ({
        ...prev,
        [sym]: { price: Number(t.c), changePct24h: Number(t.P) },
      }));
    };

    return () => ws.close();
  }, [symbols.join(",")]);

  return prices; // { BTC:{price,changePct24h}, ETH:{...}, ... }
}
