"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

const ASSETS = ["USDT", "BTC", "ETH", "SOL"];
const INTERNAL = ["Spot Wallet", "Funding Wallet", "Earn Wallet"];

export default function TransferPage() {
  const router = useRouter();
  const [type, setType] = useState("internal"); // internal | external
  const [asset, setAsset] = useState("USDT");
  const [from, setFrom] = useState("Spot Wallet");
  const [to, setTo] = useState("Funding Wallet");
  const [extAddress, setExtAddress] = useState("");
  const [amount, setAmount] = useState("");

  const valid =
    Number(amount) > 0 &&
    (type === "internal" ? from !== to : extAddress.length > 8);

  const reviewText = useMemo(() => {
    if (type === "internal") return `${amount || 0} ${asset} from ${from} → ${to}`;
    return `${amount || 0} ${asset} to ${extAddress || "address"}`;
  }, [type, asset, from, to, amount, extAddress]);

  return (
    <main className="min-h-[100dvh] bg-[#10141c]">
      <div className="sticky top-0 z-10 bg-[#10141c]/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-300 hover:text-white">
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-white text-lg font-bold">Transfer</h1>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        {/* Type */}
        <div className="flex gap-2 bg-[#161b29] rounded-xl p-1">
          {["internal", "external"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg font-semibold capitalize ${
                type === t ? "bg-blue-600 text-white" : "text-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Common: asset + amount */}
        <Field label="Asset">
          <select
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
          >
            {ASSETS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </Field>

        <Field label="Amount">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
          />
        </Field>

        {type === "internal" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="From">
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
              >
                {INTERNAL.map((n) => <option key={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="To">
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
              >
                {INTERNAL.map((n) => <option key={n}>{n}</option>)}
              </select>
            </Field>
          </div>
        ) : (
          <Field label="Recipient Address">
            <input
              value={extAddress}
              onChange={(e) => setExtAddress(e.target.value)}
              placeholder="Paste wallet address"
              className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
            />
          </Field>
        )}

        {/* Review */}
        <div className="bg-[#0f1424] border border-blue-900/30 rounded-xl p-4 text-sm text-gray-300">
          <div className="text-white font-semibold mb-1">Review</div>
          <div>{reviewText}</div>
        </div>

        <button
          disabled={!valid}
          className={`w-full rounded-xl py-3 font-bold transition ${
            valid ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-700 text-gray-300"
          }`}
          onClick={() => alert("Transfer submitted (demo).")}
        >
          Confirm Transfer
        </button>
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
