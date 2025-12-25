// src/app/api/account/summary/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { TxStatus } from "@prisma/client";

const num = (v) => {
  if (v == null) return 0;
  if (typeof v === "object" && typeof v.toString === "function") {
    const n = Number(v.toString());
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { wallet: true },
  });

  if (!user?.wallet) {
    return NextResponse.json({
      ok: true,
      totalUsd: 0,
      incomeUsd: 0,
      expenseUsd: 0,
      buckets: { cash: 0, crypto: 0, staking: 0, investments: 0, earn: 0 },
      user: {
        id: user?.id ?? null,
        name: user?.name ?? "",
        email: user?.email ?? "",
        username: user?.username ?? (user?.email ? user.email.split("@")[0] : "") ?? "",
        staqksId: user?.staqksId ?? null,
        avatar: user?.avatar ?? null,
      },
    });
  }




  const w = user.wallet;

  const buckets = {
    cash: num(w.cash),
    crypto: num(w.crypto),
    staking: num(w.staking),
    investments: num(w.investments),
    earn: num(w.earn), // ✅ real earn bucket
  };


  // ✅ Compute investment bucket from Investment table (source of truth)
  const invRows = await prisma.investment.findMany({
    where: { walletId: w.id },
    select: { balance: true },
  });

  let invFromTable = 0;
  for (const r of invRows) invFromTable += num(r.balance);

  // if table has rows, trust it; else fall back to wallet bucket
  if (invRows.length) buckets.investments = invFromTable;



  // Display-only income/expense from SUCCESS tx
  const txDone = await prisma.tx.findMany({
    where: { walletId: w.id, status: TxStatus.SUCCESS },
    select: { amount: true },
  });

  let incomeUsd = 0;
  let expenseUsd = 0;
  for (const t of txDone) {
    const a = num(t.amount);
    if (a >= 0) incomeUsd += a;
    else expenseUsd += -a;
  }

  // ✅ total = sum of unique buckets
  const totalUsd =
    num(buckets.cash) +
    num(buckets.crypto) +
    num(buckets.staking) +
    num(buckets.investments) +
    num(buckets.earn);

  return NextResponse.json({
    ok: true,
    totalUsd,
    incomeUsd,
    expenseUsd,
    buckets,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username ?? (user.email ? user.email.split("@")[0] : "") ?? "",
      staqksId: user.staqksId ?? null,
      avatar: user.avatar ?? null,
    },
  });
}
