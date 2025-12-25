"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaPlusCircle,
  FaMinusCircle,
  FaWallet,
  FaMoneyBillWave,
  FaCreditCard,
  FaArrowDown,
  FaArrowUp,
  FaCheckCircle,
} from "react-icons/fa";

const balance = 12450.75;

const methods = [
  { label: "Bank Transfer", icon: <FaMoneyBillWave className="text-green-500" />, value: "bank" },
  { label: "Credit/Debit Card", icon: <FaCreditCard className="text-blue-500" />, value: "card" },
  { label: "Crypto Wallet", icon: <FaWallet className="text-yellow-400" />, value: "crypto" },
];

const demoTx = [
  { type: "Fund", amount: "+$1,000", method: "Bank Transfer", status: "Successful" },
  { type: "Withdraw", amount: "-$300", method: "Crypto Wallet", status: "Pending" },
  { type: "Fund", amount: "+$2,000", method: "Credit Card", status: "Successful" },
];

export default function FundWithdrawPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [tab, setTab] = useState("fund");
  const [method, setMethod] = useState(methods[0].value);
  const [amount, setAmount] = useState("");
  const [success, setSuccess] = useState(false);
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    const qtab = params.get("tab");
    if (qtab && ["fund", "withdraw"].includes(qtab)) {
      setTab(qtab);
    }
  }, [params]);

  function handleMax() {
    setAmount(balance.toFixed(2));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
    setAmount("");
  }

  return (
    <main className="bg-[#10141c] min-h-screen py-8 px-2">
      {/* Balance Card */}
      <section className="max-w-lg mx-auto mb-6">
        <div className="bg-gradient-to-tr from-blue-700 to-purple-700 rounded-2xl p-6 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="text-white text-lg font-semibold">Available Balance</div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-[#23263a] rounded-full text-xs text-white px-3 py-1 font-bold outline-none"
            >
              <option>USD</option>
              <option>EUR</option>
              <option>NGN</option>
            </select>
          </div>
          <div className="text-4xl sm:text-5xl text-white font-extrabold tracking-wide">
            ${balance.toLocaleString()}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-lg mx-auto flex gap-3 mb-5">
        <TabButton active={tab === "fund"} icon={<FaPlusCircle />} label="Fund" onClick={() => setTab("fund")} />
        <TabButton active={tab === "withdraw"} icon={<FaMinusCircle />} label="Withdraw" onClick={() => setTab("withdraw")} />
      </section>

      {/* Main Form */}
      <section className="max-w-lg mx-auto bg-[#181d29] rounded-2xl p-6 shadow-xl mb-9">
        {success && (
          <div className="mb-5 flex items-center gap-3 bg-green-800/80 text-green-300 px-3 py-2 rounded-lg font-bold">
            <FaCheckCircle /> {tab === "fund" ? "Funds added successfully!" : "Withdrawal initiated!"}
          </div>
        )}

        {/* Methods */}
        <div className="flex gap-2 mb-5">
          {methods.map((m) => (
            <button
              key={m.value}
              className={`flex-1 flex flex-col items-center gap-1 px-2 py-3 rounded-lg transition font-semibold ${
                method === m.value
                  ? "bg-blue-800 text-white"
                  : "bg-[#222842] text-gray-300 hover:bg-blue-900/30"
              }`}
              onClick={() => setMethod(m.value)}
              type="button"
            >
              <span className="text-2xl">{m.icon}</span>
              <span className="text-xs">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-white font-bold">
            Amount to {tab === "fund" ? "Fund" : "Withdraw"}
          </label>
          <div className="flex items-center gap-2">
            <input
              className="flex-1 px-4 py-3 rounded-lg bg-[#222842] text-white font-semibold text-2xl outline-none focus:ring-2 ring-blue-600 transition"
              placeholder="0.00"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <button
              type="button"
              className="px-3 py-2 rounded-lg bg-blue-700 hover:bg-blue-900 text-white font-bold transition"
              onClick={handleMax}
            >
              Max
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-5 rounded-lg bg-blue-700 hover:bg-blue-900 text-white font-bold text-lg transition"
          >
            {tab === "fund" ? <FaArrowDown className="inline mr-1" /> : <FaArrowUp className="inline mr-1" />}
            {tab === "fund" ? "Fund Account" : "Withdraw Funds"}
          </button>
        </form>
      </section>

      {/* Recent Transactions */}
      <section className="max-w-lg mx-auto mb-24">
        <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
        <div className="bg-[#181d29] rounded-xl p-4 flex flex-col gap-3 shadow">
          {demoTx.map((tx, i) => (
            <TxRow key={i} {...tx} />
          ))}
        </div>
      </section>
    </main>
  );
}

function TabButton({ active, icon, label, onClick }) {
  return (
    <button
      className={`flex-1 py-2 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition ${
        active ? "bg-blue-700 text-white shadow" : "bg-[#181d29] text-gray-400"
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function TxRow({ type, amount, method, status }) {
  const isFund = type.toLowerCase() === "fund";
  return (
    <div className="flex items-center justify-between gap-3 bg-[#222842]/50 rounded-lg px-3 py-2">
      <div className="flex items-center gap-2">
        {isFund ? (
          <FaArrowDown className="text-green-400 text-lg" />
        ) : (
          <FaArrowUp className="text-yellow-300 text-lg" />
        )}
        <span className="text-white font-bold">{type}</span>
        <span className="text-gray-400 text-xs">{method}</span>
      </div>
      <div className={`font-bold ${isFund ? "text-green-400" : "text-yellow-300"}`}>{amount}</div>
      <span
        className={`px-2 py-0.5 rounded text-xs font-bold ${
          status === "Successful"
            ? "bg-green-800 text-green-300"
            : status === "Pending"
            ? "bg-yellow-700 text-yellow-300"
            : "bg-blue-700 text-blue-300"
        }`}
      >
        {status}
      </span>
    </div>
  );
}
