"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function DepositClient({ options = [] }) {
  const router = useRouter();

  // options shape: [{ asset, networks: [{ network, address, memo }] }]
  const [asset, setAsset] = useState(options[0]?.asset || "USDT");
  const [network, setNetwork] = useState(
    options[0]?.networks?.[0]?.network || "TRC20"
  );
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const currentNetworks = useMemo(() => {
    return options.find((o) => o.asset === asset)?.networks || [];
  }, [options, asset]);

  const currentAddress = useMemo(() => {
    return currentNetworks.find((n) => n.network === network) || null;
  }, [currentNetworks, network]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const fd = new FormData();
      fd.append("asset", asset);
      fd.append("network", network);
      fd.append("amount", amount);
      fd.append("currency", "USD"); // keep USD for now
      fd.append("notes", notes);
      if (receipt) fd.append("receipt", receipt);

      const res = await fetch("/api/tx/deposit", {
        method: "POST",
        body: fd,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Deposit failed");
      }

      // ✅ force server components to refresh, then show history
      router.refresh();
      router.push("/transactions");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[100dvh] bg-slate-950 text-slate-100">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold mb-2">Deposit</h1>
        <p className="text-sm text-slate-400">
          Choose the asset and network you want to fund, send the amount to the
          address shown, then upload your payment proof so it can be verified
          and credited to your account.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-[#101626] border border-slate-800 rounded-2xl p-5"
        >
          {/* Asset */}
          <div className="space-y-1">
            <label className="block text-sm text-slate-300">Asset</label>
            <select
              value={asset}
              onChange={(e) => {
                setAsset(e.target.value);
                // reset network when asset changes
                const firstNet =
                  options.find((o) => o.asset === e.target.value)?.networks?.[0]
                    ?.network || "";
                setNetwork(firstNet);
              }}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            >
              {options.map((o) => (
                <option key={o.asset} value={o.asset}>
                  {o.asset}
                </option>
              ))}
            </select>
          </div>

          {/* Network */}
          <div className="space-y-1">
            <label className="block text-sm text-slate-300">Network</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            >
              {currentNetworks.map((n) => (
                <option key={n.network} value={n.network}>
                  {n.network}
                </option>
              ))}
            </select>
          </div>

          {/* Address display */}
          {currentAddress && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">
                  Deposit address ({network})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard?.writeText(currentAddress.address)
                  }
                  className="text-xs text-sky-300 hover:text-sky-200 underline underline-offset-4"
                >
                  Copy
                </button>
              </div>
              <div className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 font-mono break-all">
                {currentAddress.address}
              </div>
              {currentAddress.memo && (
                <div className="text-xs text-amber-300">
                  Memo / Tag: <span className="font-mono">{currentAddress.memo}</span>
                </div>
              )}
            </div>
          )}

          {/* Amount */}
          <div className="space-y-1">
            <label className="block text-sm text-slate-300">
              Amount (USD value)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              placeholder="Enter deposit amount"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="block text-sm text-slate-300">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm resize-none"
              placeholder="e.g. Binance withdrawal ref, bank wire ref…"
            />
          </div>

          {/* Receipt upload */}
          <div className="space-y-1">
            <label className="block text-sm text-slate-300">
              Upload receipt / proof (optional)
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setReceipt(e.target.files?.[0] || null)}
              className="block w-full text-xs text-slate-400 file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-slate-800 file:text-slate-100 hover:file:bg-slate-700"
            />
            <p className="text-[11px] text-slate-500">
              You can upload a screenshot of the crypto transfer or bank wire
              confirmation.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-sm font-semibold py-2.5"
          >
            {busy ? "Submitting…" : "Submit Deposit"}
          </button>
        </form>
      </div>
    </main>
  );
}
