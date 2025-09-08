"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

const ASSETS = ["USDT", "BTC", "ETH", "SOL"];
const FEES = { USDT: 1.0, BTC: 0.0003, ETH: 0.003, SOL: 0.0005 }; // demo fees
const MIN_USD = 1000; // <- minimum requirement you asked

export default function WithdrawPage() {
  const router = useRouter();
  const [asset, setAsset] = useState("USDT");
  const [amount, setAmount] = useState("");   // amount in asset units
  const [amountUsd, setAmountUsd] = useState(""); // optional USD mirror
  const [address, setAddress] = useState("");

  const fee = FEES[asset];
  const net = useMemo(() => {
    const a = Number(amount || 0);
    return a > fee ? a - fee : 0;
  }, [amount, fee]);

  // For the minimum, we’ll validate on USD amount if given, else just check asset field > fee
  const meetsMin = Number(amountUsd || 0) >= MIN_USD;
  const canSubmit = address.length > 8 && Number(amount) > fee && meetsMin;

  return (
    <main className="min-h-[100dvh] bg-[#10141c]">
      <div className="sticky top-0 z-10 bg-[#10141c]/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-300 hover:text-white">
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-white text-lg font-bold">Withdraw</h1>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        <Field label="Asset">
          <select
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
          >
            {ASSETS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </Field>

        <Field label="Destination Address">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Paste wallet address"
            className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={`Amount (${asset})`}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
            />
          </Field>
          <Field label="Amount (USD) — minimum $1,000">
            <input
              type="number"
              value={amountUsd}
              onChange={(e) => setAmountUsd(e.target.value)}
              placeholder="1000"
              min={MIN_USD}
              className={`w-full bg-[#0f1424] border rounded-lg px-3 py-2 text-white ${
                Number(amountUsd || 0) >= MIN_USD
                  ? "border-blue-900/30"
                  : "border-red-500/40"
              }`}
            />
          </Field>
        </div>

        <div className="bg-[#0f1424] border border-blue-900/30 rounded-xl p-4 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Network fee</span>
            <span className="text-gray-100 font-semibold">{fee} {asset}</span>
          </div>
          <div className="flex justify-between text-gray-300 mt-2">
            <span>You will receive</span>
            <span className="text-white font-bold">{net.toFixed(6)} {asset}</span>
          </div>
          {!meetsMin && (
            <div className="mt-2 text-red-300 font-semibold">
              Minimum withdrawal is ${MIN_USD.toLocaleString()}.
            </div>
          )}
        </div>

        <button
          disabled={!canSubmit}
          className={`w-full rounded-xl py-3 font-bold transition
            ${canSubmit ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-700 text-gray-300"}`}
          onClick={() => alert("Withdrawal submitted (demo).")}
        >
          Submit Withdrawal
        </button>

        <p className="text-xs text-gray-400">
          Ensure the address matches the selected asset’s network. Transactions are irreversible.
        </p>
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-gray-300 text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}
