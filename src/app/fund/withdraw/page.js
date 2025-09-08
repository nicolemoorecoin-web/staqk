"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaMinusCircle,
  FaMoneyBillWave,
  FaCreditCard,
  FaWallet,
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
  { type: "Withdraw", amount: "-$300", method: "Bank Transfer", status: "Successful" },
  { type: "Withdraw", amount: "-$500", method: "Crypto Wallet", status: "Pending" },
];

export default function WithdrawPage() {
  const router = useRouter();
  const [method, setMethod] = useState(methods[0].value);
  const [amount, setAmount] = useState("");
  const [success, setSuccess] = useState(false);

  function handleMax() {
    setAmount(balance.toFixed(2));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
    setAmount("");
  }

  return (
    <main className="bg-[#10141c] min-h-screen py-8 px-2">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-[#10141c]/95 z-10">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
        <h1 className="text-white font-bold text-lg">Withdraw Funds</h1>
        <div className="w-6" />
      </div>

      {/* Balance Card */}
      <section className="max-w-lg mx-auto mb-6">
        <div className="bg-gradient-to-tr from-yellow-600 to-yellow-500 rounded-2xl p-6 shadow-lg">
          <div className="text-white text-lg font-semibold">Available Balance</div>
          <div className="text-4xl font-extrabold text-white">${balance.toLocaleString()}</div>
        </div>
      </section>

      {/* Methods */}
      <div className="flex gap-2 mb-5 max-w-lg mx-auto">
        {methods.map((m) => (
          <button
            key={m.value}
            onClick={() => setMethod(m.value)}
            className={`flex-1 flex flex-col items-center py-3 rounded-lg font-semibold ${
              method === m.value ? "bg-yellow-600 text-white" : "bg-[#222842] text-gray-300"
            }`}
          >
            {m.icon}
            <span className="text-xs">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#181d29] rounded-2xl p-6 max-w-lg mx-auto shadow-lg">
        {success && (
          <div className="mb-4 flex items-center gap-2 bg-green-800 text-green-300 p-2 rounded-lg">
            <FaCheckCircle /> Withdrawal Successful!
          </div>
        )}
        <label className="text-white font-bold block mb-2">Amount to Withdraw</label>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-[#222842] text-white px-4 py-2 rounded-lg"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            type="button"
            onClick={handleMax}
            className="px-3 py-2 bg-yellow-600 rounded-lg text-white font-bold"
          >
            Max
          </button>
        </div>
        <button
          type="submit"
          className="w-full mt-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg"
        >
          <FaArrowUp className="inline mr-2" /> Withdraw
        </button>
      </form>

      {/* Recent Transactions */}
      <section className="max-w-lg mx-auto mt-8">
        <h3 className="text-lg font-bold text-white mb-3">Recent Withdrawals</h3>
        <div className="bg-[#181d29] rounded-lg p-4">
          {demoTx.map((tx, i) => (
            <div key={i} className="flex justify-between text-white mb-2 last:mb-0">
              <span>{tx.method}</span><span className="text-yellow-400">{tx.amount}</span>
              <span className="text-xs text-gray-400">{tx.status}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}