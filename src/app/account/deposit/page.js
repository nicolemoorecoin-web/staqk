// src/app/account/deposit/page.js
"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiCopy, FiCreditCard, FiArrowLeft } from "react-icons/fi";
import { TbQrcode } from "react-icons/tb";


// If you prefer a lib QR, install qrcode:  npm i qrcode
// Then replace the simpleCanvasQR() with QRCode.toCanvas(canvas, address)
const ASSETS = ["USDT", "BTC", "ETH", "SOL"];
const NETWORKS = {
  USDT: ["TRON (TRC20)", "Ethereum (ERC20)", "BSC (BEP20)"],
  BTC: ["Bitcoin"],
  ETH: ["Ethereum"],
  SOL: ["Solana"],
};

export default function DepositPage() {
  const router = useRouter();

  // Tabs
  const [tab, setTab] = useState("crypto"); // crypto | card

  // Crypto deposit state
  const [asset, setAsset] = useState("USDT");
  const [network, setNetwork] = useState(NETWORKS["USDT"][0]);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");

  // Demo “max” balance per asset (replace with real)
  const DEMO_MAX = { USDT: 5000, BTC: 0.75, ETH: 12, SOL: 210 };

  // Default address based on asset/network (demo)
  const suggestedAddress = useMemo(() => {
    if (asset === "BTC") return "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
    if (asset === "ETH") return "0x12ab34Cd56eF7890abCDe1234567890abcDEF888";
    if (asset === "SOL") return "6tH2hH5Ue6Bq4y8fG1xL3R9pPK7s9k3VQn2xwR9pP";
    // USDT
    return network.includes("TRC20")
      ? "TQ4eP17zW9aQwMnx3qf6T6xg59sKf2ZpV8"
      : "0x88eB3C9A3f2F9e1d6F1c2F0a1cBe9a2dAAaA90f0";
  }, [asset, network]);

  // Keep address editable but initialize from suggestion
  useEffect(() => setAddress(suggestedAddress), [suggestedAddress]);

  // QR canvas
  const canvasRef = useRef(null);
  useEffect(() => {
    drawSimpleCanvasQR(canvasRef.current, address); // replace with QRCode.toCanvas if you install lib
  }, [address]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      alert("Address copied!");
    } catch {
      alert("Could not copy. Long‑press to copy manually.");
    }
  };

  const handleMax = () => setAmount(String(DEMO_MAX[asset] ?? ""));

  return (
    <main className="min-h-[100dvh] bg-[#10141c]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#10141c]/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-300 hover:text-white">
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-white text-lg font-bold">Deposit</h1>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 bg-[#161b29] rounded-xl p-1">
          <button
            className={`flex-1 py-2 rounded-lg font-semibold ${tab === "crypto" ? "bg-blue-600 text-white" : "text-gray-300"}`}
            onClick={() => setTab("crypto")}
          >
            <span className="inline-flex items-center gap-2"><TbQrcode /> Crypto</span>
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-semibold ${tab === "card" ? "bg-blue-600 text-white" : "text-gray-300"}`}
            onClick={() => setTab("card")}
          >
            <span className="inline-flex items-center gap-2"><FiCreditCard /> Card</span>
          </button>
        </div>

        {tab === "crypto" ? (
          <section className="space-y-5">
            {/* Asset & Network */}
            <Field label="Asset">
              <select
                value={asset}
                onChange={(e) => {
                  const a = e.target.value;
                  setAsset(a);
                  setNetwork(NETWORKS[a][0]);
                }}
                className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
              >
                {ASSETS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </Field>

            <Field label="Network">
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
              >
                {NETWORKS[asset].map((n) => <option key={n}>{n}</option>)}
              </select>
            </Field>

            {/* Amount */}
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
                Demo max available: {DEMO_MAX[asset] ?? 0} {asset}
              </p>
            </Field>

            {/* Address + QR */}
            <div className="bg-[#0f1424] border border-blue-900/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Deposit Address</h3>
                <button
                  className="text-blue-300 text-sm inline-flex items-center gap-1"
                  onClick={handleCopy}
                >
                  <FiCopy /> Copy
                </button>
              </div>

              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-black/30 border border-blue-900/20 rounded-lg px-3 py-2 text-gray-100 tracking-wider"
                spellCheck={false}
              />

              <div className="rounded-lg bg-black/30 grid place-items-center h-48">
                <canvas ref={canvasRef} className="rounded-md" />
              </div>

              <p className="text-xs text-gray-400">
                Send only <span className="text-white font-semibold">{asset}</span> via{" "}
                <span className="text-white font-semibold">{network}</span> to this address.
                Deposits to the wrong network may be lost.
              </p>
            </div>
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
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 transition">
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

/* ---------- Tiny QR helper (no dependency) ----------
   This draws a very simple “blocky” QR-like code for demo.
   For production: `npm i qrcode` and use QRCode.toCanvas(canvas, address).
*/
function drawSimpleCanvasQR(canvas, text = "") {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const N = 33; // grid
  const size = 192;
  canvas.width = size;
  canvas.height = size;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#111827";

  // poor-man hash to vary pattern by text
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const bit = ((h >> ((x + y * N) % 31)) & 1) === 1;
      if (bit && Math.random() > 0.35) {
        const px = Math.floor((x * size) / N);
        const py = Math.floor((y * size) / N);
        const w = Math.ceil(size / N);
        ctx.fillRect(px, py, w, w);
      }
    }
  }
}
