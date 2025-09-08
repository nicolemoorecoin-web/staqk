"use client";
import useCryptoWS from "./useCryptoWS";  // <— note the path

export default function LivePriceBar() {
  const live = useCryptoWS(["BTC","ETH","SOL","BNB","ADA","XRP","DOGE"]);
  // ...rest stays the same
}
