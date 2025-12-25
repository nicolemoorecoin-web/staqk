import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { TxType, TxStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Same helper pattern as above (local to this file)
async function applyTxToWallet(walletId, amountDecimal) {
  const amt = Number(amountDecimal);
  if (!Number.isFinite(amt) || amt === 0) return;

  const change = amt;
  const incomeChange = change > 0 ? change : 0;
  const expenseChange = change < 0 ? -change : 0;

  await prisma.wallet.update({
    where: { id: walletId },
    data: {
      total: { increment: change },
      income: { increment: incomeChange },
      expense: { increment: expenseChange },
    },
  });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!me || me.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, amount, type = "DEPOSIT", note = "" } = body || {};
  const n = Number(amount);

  if (!email || !Number.isFinite(n) || n <= 0) {
    return NextResponse.json({ error: "Invalid email or amount" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { wallet: true },
  });
  if (!user || !user.wallet) {
    return NextResponse.json({ error: "User or wallet not found" }, { status: 404 });
  }

  const txType = type === "WITHDRAW" ? TxType.WITHDRAW : TxType.DEPOSIT;
  const signedAmount = txType === TxType.WITHDRAW ? -Math.abs(n) : Math.abs(n);

  const tx = await prisma.tx.create({
    data: {
      walletId: user.wallet.id,
      title: note || (txType === TxType.DEPOSIT ? "Admin credit" : "Admin debit"),
      type: txType,
      amount: signedAmount,
      currency: "USD",
      status: TxStatus.SUCCESS,
      notes: note,
    },
  });

  // Because this tx is created already SUCCESS, immediately apply it
  await applyTxToWallet(user.wallet.id, tx.amount);

  return NextResponse.json({ ok: true, id: tx.id });
}
