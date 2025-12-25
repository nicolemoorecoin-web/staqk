// src/app/api/tx/deposit/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { TxType, TxStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizeAsset(v) {
  return String(v || "")
    .trim()
    .toUpperCase();
}

/**
 * Normalizes both:
 * - "Bitcoin" -> "BITCOIN"
 * - "Solana" -> "SOLANA"
 * - "Ethereum" -> "ETHEREUM"
 * - "TRON (TRC20)" -> "TRC20"
 * - "Ethereum (ERC20)" -> "ERC20"
 * - "BSC (BEP20)" -> "BEP20"
 * Also accepts already-normalized inputs.
 */
function normalizeNetwork(v) {
  const raw = String(v || "").trim();
  const up = raw.toUpperCase();

  // Common label -> code mappings (from your Deposit UI)
  const MAP = {
    "TRON (TRC20)": "TRC20",
    "TRON/TRC20": "TRC20",
    TRON: "TRC20",
    TRC20: "TRC20",

    "ETHEREUM (ERC20)": "ERC20",
    "ETH (ERC20)": "ERC20",
    ERC20: "ERC20",

    "BSC (BEP20)": "BEP20",
    "BINANCE SMART CHAIN (BEP20)": "BEP20",
    BEP20: "BEP20",
    BSC: "BEP20",

    BITCOIN: "BITCOIN",
    BTC: "BITCOIN",
    "BTC NETWORK": "BITCOIN",
    "BITCOIN NETWORK": "BITCOIN",
    Bitcoin: "BITCOIN",

    ETHEREUM: "ETHEREUM",
    ETH: "ETHEREUM",
    "ETH NETWORK": "ETHEREUM",
    Ethereum: "ETHEREUM",

    SOLANA: "SOLANA",
    SOL: "SOLANA",
    "SOL NETWORK": "SOLANA",
    Solana: "SOLANA",
  };

  // Try exact raw match first (case-sensitive labels like "Bitcoin")
  if (MAP[raw]) return MAP[raw];

  // Then try uppercased match
  if (MAP[up]) return MAP[up];

  // Fallback: if it includes common codes in text
  if (up.includes("TRC20")) return "TRC20";
  if (up.includes("ERC20")) return "ERC20";
  if (up.includes("BEP20")) return "BEP20";
  if (up.includes("BITCOIN")) return "BITCOIN";
  if (up.includes("SOLANA")) return "SOLANA";
  if (up.includes("ETHEREUM")) return "ETHEREUM";

  // Last resort: store a normalized uppercase string
  return up;
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const ctype = req.headers.get("content-type") || "";
  let payload = {};
  let file = null;

  if (ctype.includes("application/json")) {
    payload = await req.json().catch(() => ({}));
  } else {
    const form = await req.formData();
    payload.asset = String(form.get("asset") || "USDT");
    payload.network = String(form.get("network") || "TRC20");
    payload.amount = form.get("amount");
    payload.currency = String(form.get("currency") || "USD");
    payload.notes = String(form.get("notes") || "");
    file = form.get("receipt");
  }

  let {
    amount,
    currency = "USD",
    asset = "USDT",
    network = "TRC20",
    notes = "",
  } = payload;

  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid amount" }, { status: 400 });
  }

  // ✅ Normalize to match AdminAddress composite key
  const assetKey = normalizeAsset(asset);
  const networkKey = normalizeNetwork(network);

  // user + wallet
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { wallet: true },
  });
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  let wallet = user.wallet;
  if (!wallet) wallet = await prisma.wallet.create({ data: { userId: user.id } });

  // ✅ admin address lookup (now matches BTC/SOL/ETH/USDT consistently)
  const addr = await prisma.adminAddress.findUnique({
    where: { asset_network: { asset: assetKey, network: networkKey } },
  });

  let address = null;
  let meta = {
    requested: { asset, network },
    normalized: { asset: assetKey, network: networkKey },
  };

  if (addr?.active) {
    address = addr.address;
    meta = {
      ...meta,
      adminAddressId: addr.id,
      address: addr.address,
      memo: addr.memo || null,
    };
  }

  // receipt (optional)
  let receiptUrl = null;
  if (file && typeof file.arrayBuffer === "function") {
    const buf = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "application/octet-stream";
    receiptUrl = `data:${mime};base64,${buf.toString("base64")}`;
  }

  // Create a PENDING tx (no wallet balance change yet)
  const tx = await prisma.tx.create({
    data: {
      walletId: wallet.id,
      title: `${assetKey} Deposit`,
      type: TxType.DEPOSIT,
      amount: n,
      currency,
      status: TxStatus.PENDING,
      asset: assetKey,
      network: networkKey,
      address,
      receiptUrl,
      notes,
      meta,
    },
  });

  return NextResponse.json(
    { ok: true, id: tx.id, status: tx.status, addressFound: Boolean(address), asset: assetKey, network: networkKey },
    { headers: { "cache-control": "no-store" } }
  );
}
