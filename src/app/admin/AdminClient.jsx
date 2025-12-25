"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
  FiSend,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

export default function AdminClient({ me, pending = [], addresses = [] }) {
  const router = useRouter();

  // Fund account form
  const [fundEmail, setFundEmail] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [fundType, setFundType] = useState("DEPOSIT"); // or WITHDRAW
  const [fundNote, setFundNote] = useState("");
  const [fundLoading, setFundLoading] = useState(false);
  const [fundMsg, setFundMsg] = useState(null);
  const [fundError, setFundError] = useState(null);

  // Deposit address form
  const [addrAsset, setAddrAsset] = useState("USDT");
  const [addrNetwork, setAddrNetwork] = useState("TRC20");
  const [addrAddress, setAddrAddress] = useState("");
  const [addrMemo, setAddrMemo] = useState("");
  const [addrActive, setAddrActive] = useState(true);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrError, setAddrError] = useState(null);

  async function updateTxStatus(id, status) {
    try {
      const res = await fetch("/api/admin/tx-update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txId: id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      router.refresh();
    } catch (err) {
      alert(err.message || "Could not update transaction.");
    }
  }

  async function handleFundAccount(e) {
    e.preventDefault();
    setFundMsg(null);
    setFundError(null);

    const amt = Number(fundAmount);
    if (!fundEmail || !Number.isFinite(amt) || amt <= 0) {
      setFundError("Enter a valid email and positive amount.");
      return;
    }

    try {
      setFundLoading(true);
      const res = await fetch("/api/admin/fund-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fundEmail,
          amount: amt,
          type: fundType,
          note: fundNote,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setFundMsg("Account funded successfully.");
      setFundAmount("");
      setFundNote("");
      router.refresh();
    } catch (err) {
      setFundError(err.message || "Could not fund account.");
    } finally {
      setFundLoading(false);
    }
  }

  async function handleSaveAddress(e) {
    e.preventDefault();
    setAddrError(null);

    if (!addrAsset || !addrNetwork || !addrAddress) {
      setAddrError("Asset, network, and address are required.");
      return;
    }

    try {
      setAddrLoading(true);
      const res = await fetch("/api/admin/deposit-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset: addrAsset,
          network: addrNetwork,
          address: addrAddress,
          memo: addrMemo,
          active: addrActive,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setAddrAddress("");
      setAddrMemo("");
      router.refresh();
    } catch (err) {
      setAddrError(err.message || "Could not save address.");
    } finally {
      setAddrLoading(false);
    }
  }

  async function handleDeleteAddress(id) {
    if (!confirm("Delete this deposit address?")) return;
    try {
      const res = await fetch("/api/admin/deposit-address", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      router.refresh();
    } catch (err) {
      alert(err.message || "Could not delete address.");
    }
  }

  return (
    <main className="min-h-[100dvh] bg-[#050816] text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-blue-900/40 bg-[#050816]/95 backdrop-blur">
        <button
          onClick={() => router.push("/home")}
          className="text-gray-400 hover:text-white flex items-center gap-1"
        >
          <FiArrowLeft /> <span className="text-sm">Back</span>
        </button>
        <h1 className="text-lg font-bold">Admin Dashboard</h1>
        <div className="text-xs text-gray-400">
          {me?.email}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Pending approvals */}
        <section className="bg-[#0b1020] rounded-2xl border border-blue-900/40 shadow-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base">Pending Transactions</h2>
            <span className="text-xs text-gray-400">
              {pending.length} waiting
            </span>
          </div>

          {pending.length === 0 ? (
            <p className="text-sm text-gray-400">No pending deposits or withdrawals.</p>
          ) : (
            <div className="space-y-2">
              {pending.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 bg-[#050b19] border border-blue-900/30 rounded-xl px-3 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-200">
                        {t.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(t.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-semibold truncate">
                      {t.title || `${t.type} request`}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {t.userEmail} {t.userName ? `• ${t.userName}` : ""}
                    </div>
                    <div className="mt-1 text-sm">
                      <span className={t.amount < 0 ? "text-red-400" : "text-emerald-400"}>
                        {t.amount < 0 ? "-" : "+"}
                        {Math.abs(t.amount).toLocaleString()} {t.currency || "USD"}
                      </span>
                      {t.asset && (
                        <span className="text-xs text-gray-400 ml-2">
                          ({t.asset} {t.network || ""})
                        </span>
                      )}
                    </div>
                    {t.notes && (
                      <div className="mt-1 text-xs text-gray-400">
                        Note: {t.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => updateTxStatus(t.id, "FAILED")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-500/50 text-red-300 text-xs hover:bg-red-500/10"
                    >
                      <FiXCircle /> Reject
                    </button>
                    <button
                      onClick={() => updateTxStatus(t.id, "SUCCESS")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-500/50 text-emerald-300 text-xs hover:bg-emerald-500/10"
                    >
                      <FiCheckCircle /> Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Fund account */}
        <section className="bg-[#0b1020] rounded-2xl border border-blue-900/40 shadow-xl p-4">
          <h2 className="font-bold text-base mb-3">Fund / Adjust Account</h2>
          <form
            onSubmit={handleFundAccount}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <label className="text-xs text-gray-300 space-y-1">
              Email
              <input
                type="email"
                value={fundEmail}
                onChange={(e) => setFundEmail(e.target.value)}
                className="w-full bg-[#050b19] border border-blue-900/40 rounded-lg px-3 py-2 text-sm text-white"
                placeholder="user@example.com"
              />
            </label>

            <label className="text-xs text-gray-300 space-y-1">
              Amount (USD)
              <input
                type="number"
                min="0"
                step="0.01"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="w-full bg-[#050b19] border border-blue-900/40 rounded-lg px-3 py-2 text-sm text-white"
                placeholder="1000"
              />
            </label>

            <label className="text-xs text-gray-300 space-y-1">
              Type
              <select
                value={fundType}
                onChange={(e) => setFundType(e.target.value)}
                className="w-full bg-[#050b19] border border-blue-900/40 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="DEPOSIT">Credit (Deposit)</option>
                <option value="WITHDRAW">Debit (Withdrawal)</option>
              </select>
            </label>

            <label className="text-xs text-gray-300 space-y-1 md:col-span-1">
              Note (optional)
              <input
                type="text"
                value={fundNote}
                onChange={(e) => setFundNote(e.target.value)}
                className="w-full bg-[#050b19] border border-blue-900/40 rounded-lg px-3 py-2 text-sm text-white"
                placeholder="Adjustment, bonus, manual credit..."
              />
            </label>

            {fundError && (
              <p className="text-xs text-red-400 md:col-span-2">{fundError}</p>
            )}
            {fundMsg && !fundError && (
              <p className="text-xs text-emerald-400 md:col-span-2">{fundMsg}</p>
            )}

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={fundLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold disabled:opacity-60"
              >
                {fundLoading ? "Processing..." : "Fund Account"}
                <FiSend className="text-sm" />
              </button>
            </div>
          </form>
        </section>

        {/* Deposit addresses */}
        <section className="bg-[#0b1020] rounded-2xl border border-blue-900/40 shadow-xl p-4">
          <h2 className="font-bold text-base mb-3">Deposit Addresses</h2>

          <div className="space-y-2 mb-4">
            {addresses.length === 0 ? (
              <p className="text-xs text-gray-400">No deposit addresses configured yet.</p>
            ) : (
              addresses.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 bg-[#050b19] border border-blue-900/40 rounded-xl px-3 py-2 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {a.asset} • {a.network}
                      </span>
                      {!a.active && (
                        <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-[10px] font-bold">
                          INACTIVE
                        </span>
                      )}
                    </div>
                    <div className="mt-1 font-mono break-all text-gray-200">
                      {a.address}
                    </div>
                    {a.memo && (
                      <div className="mt-1 text-[11px] text-gray-400">
                        Memo: {a.memo}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(a.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 text-[11px]"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSaveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-xs text-gray-300 space-y-1">
              Asset
              <input
                value={addrAsset}
                onChange={(e) => setAddrAsset(e.target.value.toUpperCase())}
                className="w-full bg-[#050b19] border border-blue-900/40 rounded-lg px-3 py-2 text-sm text-white"
                placeholder="USDT"
              />
            </label>
            <label className="text-xs text-gray-300 space-y-1">
              Network
              <input
                value={addrNetwork}
                onChange={(e) => setAddrNetwork(e.target.value)}
                className="w-full bg-[#050b19] border border-blue-900/40 rounded-lg px-3 py-2 text-sm text-white"
                placeholder="TRC20"
              />
            </label>
            <label className="text-xs text-gray-300 space-y-1 md:col-span-2">
              Address
              <input
                value={addrAddress}
                onChange={(e) => setAddrAddress(e.target.value)}
                className="w-full bg-[#050b19] border border-blue-900/40 rounded-lg px-3 py-2 text-sm text-white font-mono"
                placeholder="Your USDT deposit address"
              />
            </label>
            <label className="text-xs text-gray-300 space-y-1 md:col-span-2">
              Memo / Tag (optional)
              <input
                value={addrMemo}
                onChange={(e) => setAddrMemo(e.target.value)}
                className="w-full bg-[#050b19] border border-blue-900/40 rounded-lg px-3 py-2 text-sm text-white"
                placeholder="Memo / tag if required"
              />
            </label>
            <label className="text-xs text-gray-300 inline-flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={addrActive}
                onChange={(e) => setAddrActive(e.target.checked)}
              />
              Active
            </label>

            {addrError && (
              <p className="text-xs text-red-400 md:col-span-2">{addrError}</p>
            )}

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={addrLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold disabled:opacity-60"
              >
                {addrLoading ? "Saving..." : "Save / Update Address"}
                <FiPlus className="text-sm" />
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
