// src/app/api/tx/transfer/route.js
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
  const { amountUsd, fee, typeLabel, meta } = body || {};

  const amt = num(amountUsd);
  if (!amt || amt <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

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
      title: `Bank Transfer — ${typeLabel || "Domestic"}`,
      type: "TRANSFER",
      amount: -Math.abs(amt + (num(fee) || 0)), // debit incl. fee
      currency: "USD",
      status: "PENDING",
      // meta, if you have that column:
      // meta,
    },
  });

  return NextResponse.json({ ok: true, tx });
}
