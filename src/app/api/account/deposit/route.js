// src/app/api/tx/deposit/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { TxType, TxStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const {
    amount,
    currency = "USD",
    asset = "USDT",
    network = "TRC20",
    notes = "",
  } = payload;

  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  // user + wallet
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { wallet: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  let wallet = user.wallet;
  if (!wallet) wallet = await prisma.wallet.create({ data: { userId: user.id } });

  // admin address lookup (optional)
  const addr = await prisma.adminAddress.findUnique({
    where: { asset_network: { asset, network } },
  });

  let address = null;
  let meta = null;
  if (addr?.active) {
    address = addr.address;
    meta = { adminAddressId: addr.id, address: addr.address, memo: addr.memo || null };
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
      title: `${asset} Deposit`,
      type: TxType.DEPOSIT,
      amount: n,
      currency,
      status: TxStatus.PENDING,
      asset,
      network,
      address,
      receiptUrl,
      notes,
      meta,
    },
  });

  return NextResponse.json({ ok: true, id: tx.id, createdAt: tx.createdAt }, { headers: { "cache-control": "no-store" } });
}
