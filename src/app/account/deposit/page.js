"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiCopy,
  FiCreditCard,
  FiArrowLeft,
  FiUploadCloud,
  FiTrash2,
  FiClock,
  FiCheck,
} from "react-icons/fi";
import { TbQrcode } from "react-icons/tb";
import QRCode from "qrcode";

/* assets + network codes (must match AdminAddress.network) */
const ASSETS = ["USDT", "BTC", "ETH", "SOL"];

const NETWORKS = {
  USDT: [
    { label: "TRON (TRC20)", code: "TRC20" },
    { label: "Ethereum (ERC20)", code: "ERC20" },
    { label: "BSC (BEP20)", code: "BEP20" },
  ],
  BTC: [{ label: "Bitcoin", code: "BITCOIN" }],
  ETH: [{ label: "Ethereum", code: "ETHEREUM" }], // keep ONE standard for ETH
  SOL: [{ label: "Solana", code: "SOLANA" }],
};


export default function DepositPage() {
  const router = useRouter();

  const [tab, setTab] = useState("crypto");
  const [submitted, setSubmitted] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [asset, setAsset] = useState("USDT");
  const [networkCode, setNetworkCode] = useState(NETWORKS.USDT[0].code);
  const [amount, setAmount] = useState("");

  // fetched from admin table
  const [depositAddress, setDepositAddress] = useState("");
  const [depositMemo, setDepositMemo] = useState("");
  const [addrLoading, setAddrLoading] = useState(false);

  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState("");

  const canvasRef = useRef(null);

  const selectedNetwork = useMemo(() => {
    return (NETWORKS[asset] || []).find((n) => n.code === networkCode) || NETWORKS[asset]?.[0];
  }, [asset, networkCode]);

  // demo max balance per asset
  const DEMO_MAX = { USDT: 1000, BTC: 0.75, ETH: 12, SOL: 210 };

  // Fetch admin address whenever asset/network changes
  useEffect(() => {
    let live = true;

    async function loadAddr() {
      setAddrLoading(true);
      setError("");
      try {
        const qs = new URLSearchParams({ asset, network: networkCode }).toString();
        const r = await fetch(`/api/deposit-address?${qs}`, { cache: "no-store" });
        const j = await r.json().catch(() => ({}));
        if (!live) return;

        if (!r.ok || !j.ok) throw new Error(j.error || "Failed to fetch deposit address");

        if (j.found && j.address?.address) {
          setDepositAddress(j.address.address);
          setDepositMemo(j.address.memo || "");
        } else {
          setDepositAddress("");
          setDepositMemo("");
        }
      } catch (e) {
        if (!live) return;
        setDepositAddress("");
        setDepositMemo("");
        setError(e?.message || "Could not load deposit address");
      } finally {
        if (live) setAddrLoading(false);
      }
    }

    loadAddr();
    return () => {
      live = false;
    };
  }, [asset, networkCode]);

  // Generate QR whenever address changes
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    if (!depositAddress) {
      const ctx = c.getContext("2d");
      c.width = 192;
      c.height = 192;
      ctx.clearRect(0, 0, 192, 192);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(0, 0, 192, 192);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "12px system-ui";
      ctx.fillText("No address", 56, 98);
      return;
    }

    QRCode.toCanvas(c, depositAddress, { width: 192, margin: 1 }).catch(() => {});
  }, [depositAddress]);

  const handleCopy = async () => {
    if (!depositAddress) return;
    try {
      await navigator.clipboard.writeText(depositAddress);
      alert("Address copied!");
    } catch {
      alert("Could not copy. Long-press to copy manually.");
    }
  };

  const handleMax = () => setAmount(String(DEMO_MAX[asset] ?? ""));

  const onPickReceipt = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      alert("Max file size is 10MB.");
      return;
    }
    setReceiptFile(f);
    setReceiptUrl(URL.createObjectURL(f));
  };

  const clearReceipt = () => {
    if (receiptUrl) URL.revokeObjectURL(receiptUrl);
    setReceiptFile(null);
    setReceiptUrl("");
  };

  const canSubmit = Number(amount) > 0 && !!receiptFile && !!depositAddress;

  const submitDeposit = async () => {
    const amt = Number(amount);
    if (!canSubmit || !(amt > 0)) return;

    setError("");
    setBusy(true);

    try {
      const fd = new FormData();
      fd.append("asset", asset);
      fd.append("network", networkCode); // ✅ send code that matches AdminAddress.network
      fd.append("amount", amount);
      fd.append("currency", "USD");
      fd.append("notes", depositMemo ? `Memo: ${depositMemo}` : "");
      if (receiptFile) fd.append("receipt", receiptFile);

      const res = await fetch("/api/tx/deposit", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Deposit failed");

      setReceipt({
        amount: amt,
        asset,
        network: selectedNetwork?.label || networkCode,
        address: depositAddress,
        memo: depositMemo || "",
        ts: Date.now(),
        fileName: receiptFile?.name,
        filePreview: receiptUrl,
      });

      setSubmitted(true);
      setAmount("");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleCardPay = () => router.push("/support/live-chat?topic=card-deposit");

  const done = () => {
    if (receipt?.filePreview) URL.revokeObjectURL(receipt.filePreview);
    setReceipt(null);
    setSubmitted(false);
    clearReceipt();
    router.push("/home");
  };

  return (
    <main className="min-h-[100dvh] bg-[#10141c]">
      <div className="sticky top-0 z-10 bg-[#10141c]/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-300 hover:text-white">
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-white text-lg font-bold">Deposit</h1>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        {!submitted && (
          <div className="flex gap-2 bg-[#161b29] rounded-xl p-1">
            <button
              className={`flex-1 py-2 rounded-lg font-semibold ${
                tab === "crypto" ? "bg-blue-600 text-white" : "text-gray-300"
              }`}
              onClick={() => setTab("crypto")}
            >
              <span className="inline-flex items-center gap-2">
                <TbQrcode /> Crypto
              </span>
            </button>
            <button
              className={`flex-1 py-2 rounded-lg font-semibold ${
                tab === "card" ? "bg-blue-600 text-white" : "text-gray-300"
              }`}
              onClick={() => setTab("card")}
            >
              <span className="inline-flex items-center gap-2">
                <FiCreditCard /> Card
              </span>
            </button>
          </div>
        )}

        {submitted && receipt ? (
          <section className="space-y-5">
            <div className="bg-[#0f1424] border border-blue-900/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/15 text-yellow-300">
                  <FiClock />
                </span>
                <h2 className="text-white font-bold">Deposit submitted — Pending review</h2>
              </div>

              {receipt.filePreview && (
                <img
                  src={receipt.filePreview}
                  alt="receipt preview"
                  className="w-full max-h-60 object-contain rounded-lg border border-white/10 mb-4"
                />
              )}

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <div>
                  <dt className="text-gray-400">Amount</dt>
                  <dd className="text-white font-semibold">
                    {formatNumber(receipt.amount)} <span className="text-gray-300">{receipt.asset}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-400">Submitted</dt>
                  <dd className="text-white font-semibold">{formatDateTime(receipt.ts)}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Network</dt>
                  <dd className="text-white font-semibold">{receipt.network}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-400">Deposit Address</dt>
                  <dd className="text-white font-mono break-all">{receipt.address}</dd>
                </div>
                {receipt.memo ? (
                  <div className="sm:col-span-2">
                    <dt className="text-gray-400">Memo / Tag</dt>
                    <dd className="text-white font-semibold">{receipt.memo}</dd>
                  </div>
                ) : null}
                {receipt.fileName && (
                  <div className="sm:col-span-2">
                    <dt className="text-gray-400">Receipt file</dt>
                    <dd className="text-white">{receipt.fileName}</dd>
                  </div>
                )}
              </dl>

              <p className="text-xs text-gray-400 mt-4">
                Your receipt was received and is being reviewed. Funds will be credited once confirmed
                and approved.
              </p>

              <button
                onClick={done}
                className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 inline-flex items-center justify-center gap-2"
              >
                <FiCheck /> Done
              </button>
            </div>
          </section>
        ) : tab === "crypto" ? (
          <section className="space-y-5">
            <Field label="Asset">
              <select
                value={asset}
                onChange={(e) => {
                  const a = e.target.value;
                  setAsset(a);
                  setNetworkCode(NETWORKS[a][0].code);
                }}
                className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
              >
                {ASSETS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>

            <Field label="Network">
              <select
                value={networkCode}
                onChange={(e) => setNetworkCode(e.target.value)}
                className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
              >
                {(NETWORKS[asset] || []).map((n) => (
                  <option key={n.code} value={n.code}>
                    {n.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={`Amount (${asset})`}>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
                />
                <button
                  type="button"
                  onClick={handleMax}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Max
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                 Deposit Min: {DEMO_MAX[asset] ?? 0} {asset}
              </p>
            </Field>

            <div className="bg-[#0f1424] border border-blue-900/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Deposit Address</h3>
                <button
                  className="text-blue-300 text-sm inline-flex items-center gap-1 disabled:opacity-50"
                  onClick={handleCopy}
                  disabled={!depositAddress}
                >
                  <FiCopy /> Copy
                </button>
              </div>

              {addrLoading ? (
                <div className="text-sm text-gray-300">Loading address…</div>
              ) : depositAddress ? (
                <>
                  <div className="w-full bg-black/30 border border-blue-900/20 rounded-lg px-3 py-2 text-gray-100 font-mono break-all">
                    {depositAddress}
                  </div>

                  {depositMemo ? (
                    <div className="text-xs text-yellow-200 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                      Memo/Tag required: <span className="font-semibold">{depositMemo}</span>
                    </div>
                  ) : null}

                  <div className="rounded-lg bg-black/30 grid place-items-center h-48">
                    <canvas ref={canvasRef} className="rounded-md" />
                  </div>
                </>
              ) : (
                <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  No active deposit address set for {asset} ({networkCode}). Ask admin to add one.
                </div>
              )}

              <p className="text-xs text-gray-400">
                Send only <span className="text-white font-semibold">{asset}</span> via{" "}
                <span className="text-white font-semibold">{selectedNetwork?.label || networkCode}</span>.
              </p>
            </div>

            <div className="bg-[#0f1424] border border-blue-900/30 rounded-xl p-4 space-y-3">
              <div className="text-white font-semibold">Upload Receipt</div>

              <label className="block">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={onPickReceipt}
                  className="hidden"
                  id="receipt-input"
                />
                <div className="cursor-pointer border border-dashed border-blue-900/40 rounded-xl p-4 text-center hover:bg:white/5 transition">
                  <div className="inline-flex items-center gap-2 text-blue-300 font-semibold">
                    <FiUploadCloud /> Choose file
                  </div>
                  <div className="text-xs text-gray-400 mt-1">PNG, JPG or PDF. Max 10MB.</div>
                </div>
              </label>

              {receiptFile && (
                <div className="flex items-center gap-3">
                  {receiptFile.type.startsWith("image/") ? (
                    <img
                      src={receiptUrl}
                      alt="receipt preview"
                      className="h-24 w-24 object-cover rounded-lg border border-white/10"
                    />
                  ) : (
                    <div className="h-24 w-24 grid place-items-center rounded-lg border border-white/10 text-xs text-gray-300">
                      PDF
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{receiptFile.name}</p>
                    <p className="text-xs text-gray-400">
                      {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button onClick={clearReceipt} className="text-red-300 hover:text-red-200">
                    <FiTrash2 className="text-lg" />
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              disabled={!canSubmit || busy}
              onClick={submitDeposit}
              className={`w-full rounded-xl py-3 font-bold transition ${
                canSubmit && !busy ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-700 text-gray-300"
              }`}
            >
              {busy ? "Submitting…" : "Submit Deposit"}
            </button>
          </section>
        ) : (
          <section className="space-y-5">
            <Field label="Amount (USD)">
              <input
                type="number"
                min="10"
                placeholder="100"
                className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
              />
            </Field>
            <button
              onClick={handleCardPay}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 transition"
            >
              Pay with Card
            </button>
            <p className="text-xs text-gray-400 text-center">Securely processed. Minimum $10.</p>
          </section>
        )}
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

function formatNumber(n) {
  try {
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  } catch {
    return String(n);
  }
}

function formatDateTime(ts) {
  const d = new Date(ts || Date.now());
  return d.toLocaleString();
}
