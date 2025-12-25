// src/app/api/tx/withdraw/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

const num = (v) => Number(v || 0);

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { amountUsd, title, asset, address, feeAsset, netAsset } = body || {};

  const amt = num(amountUsd);
  if (!amt || amt <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  // find wallet for this user (same pattern as /api/account/summary)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { wallet: true },
  });

  if (!user || !user.wallet) {
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  }

  const tx = await prisma.tx.create({
    data: {
      walletId: user.wallet.id,
      title: title || `Withdrawal — ${asset || "USD"}`,
      type: "WITHDRAW",             // TxType enum
      amount: -Math.abs(amt),       // negative for outflow
      currency: "USD",
      status: "PENDING",            // TxStatus enum
      // if you have a JSON/meta column you can add:
      // meta: { asset, address, feeAsset, netAsset },
    },
  });

  return NextResponse.json({ ok: true, tx });
}
