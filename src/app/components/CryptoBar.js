'use client';
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import Image from "next/image";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const coinsToShow = [
  { symbol: "BTC", name: "Bitcoin", icon: "/crypto/btc.svg" },
  { symbol: "ETH", name: "Ethereum", icon: "/crypto/eth.svg" },
  { symbol: "SOL", name: "Solana", icon: "/crypto/sol.svg" },
  { symbol: "DOGE", name: "Dogecoin", icon: "/crypto/doge.svg" },
  { symbol: "XRP", name: "Ripple", icon: "/crypto/xrp.svg" },
  { symbol: "BCH", name: "Bitcoin Cash", icon: "/crypto/bch.svg" },
  { symbol: "LTC", name: "Litecoin", icon: "/crypto/ltc.svg" },
  { symbol: "BNB", name: "Binance Coin", icon: "/crypto/bnb.svg" },
];

export default function CryptoBar() {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    async function fetchPrices() {
      const symbols = coinsToShow.map((c) => c.symbol).join(",");
      const res = await fetch(
        `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols}&tsyms=USD`
      );
      const data = await res.json();
      setPrices(data);
    }
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  // Split into 2 groups of 4 coins each
  const slides = [coinsToShow.slice(0, 4), coinsToShow.slice(4, 8)];

  const settings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    pauseOnHover: false,
  };

  return (
    <div className="w-full bg-[#111827] py-4 px-4 rounded-xl shadow-lg mt-4 max-w-2xl mx-auto">
      <Slider {...settings}>
        {slides.map((coins, idx) => (
          <div key={idx}>
            <div className="flex flex-row justify-between items-stretch w-full gap-4">
              {coins.map((coin) => (
                <div
                  key={coin.symbol}
                  className="flex flex-col items-center bg-[#1f2937] rounded-lg px-2 py-2 shadow w-1/4 min-w-[80px] max-w-[120px] mx-auto"
                  // Use both w-1/4 and min-w to force proper sizing
                >
                  <Image
                    src={coin.icon}
                    alt={coin.symbol}
                    width={36}
                    height={36}
                    className="mb-1"
                  />
                  <span className="font-bold text-sm text-gray-100 text-center">{coin.name}</span>
                  <span className="text-xs text-gray-400 mb-1">{coin.symbol}</span>
                  <span className="text-lg font-semibold text-green-400">
                    ${prices[coin.symbol]?.USD
                      ? prices[coin.symbol].USD.toLocaleString()
                      : "--"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
