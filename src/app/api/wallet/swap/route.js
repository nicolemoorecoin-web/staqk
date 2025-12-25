// src/app/api/wallet/swap/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { TxStatus, TxType } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * IMPORTANT:
 * - "investments" is a reserved ledger bucket controlled by /api/investments/move
 *   to keep wallet totals consistent with Investment rows.
 * - Swap is only for liquid buckets.
 */
const SWAPPABLE = new Set(["cash", "crypto", "staking", "earn"]);

const BUCKET_FIELD = {
  cash: "cash",
  crypto: "crypto",
  staking: "staking",
  investments: "investments",
  earn: "earn",
};

function normBucket(v) {
  const s = String(v || "").trim().toLowerCase();
  if (s === "investment" || s === "investmentwallet") return "investments";
  if (s === "cryptoearn") return "earn";
  return s;
}

function num(v) {
  if (v == null) return 0;
  if (typeof v === "object" && typeof v.toString === "function") {
    const n = Number(v.toString());
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function bucketsToNumbers(w) {
  return {
    cash: num(w.cash),
    crypto: num(w.crypto),
    staking: num(w.staking),
    investments: num(w.investments),
    earn: num(w.earn),
  };
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const from = normBucket(body?.from);
  const to = normBucket(body?.to);
  const amount = num(body?.amount);

  if (!BUCKET_FIELD[from] || !BUCKET_FIELD[to]) {
    return NextResponse.json({ ok: false, error: "Invalid wallet selection" }, { status: 400 });
  }
  if (from === to) {
    return NextResponse.json({ ok: false, error: "Choose two different wallets" }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid amount" }, { status: 400 });
  }

  // 🔒 Block swaps that would desync investment ledger vs Investment rows
  if (!SWAPPABLE.has(from) || !SWAPPABLE.has(to)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Investment Wallet is managed. Use the Investments page (Deposit/Withdraw) instead of Swap.",
      },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { wallet: true },
  });

  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  if (!user.wallet) return NextResponse.json({ ok: false, error: "Wallet not found" }, { status: 404 });

  const fromField = BUCKET_FIELD[from];
  const toField = BUCKET_FIELD[to];

  const fiat = String(user.fiatCurrency || "USD").toUpperCase();

  try {
    const updatedWallet = await prisma.$transaction(async (tx) => {
      const w = await tx.wallet.findUnique({
        where: { id: user.wallet.id },
        select: {
          id: true,
          cash: true,
          crypto: true,
          staking: true,
          investments: true,
          earn: true,
        },
      });

      if (!w) throw new Error("Wallet not found");

      const currentFrom = num(w[fromField]);
      if (currentFrom < amount) {
        throw new Error("Insufficient funds");
      }

      const updated = await tx.wallet.update({
        where: { id: user.wallet.id },
        data: {
          [fromField]: { decrement: amount },
          [toField]: { increment: amount },
        },
        select: {
          cash: true,
          crypto: true,
          staking: true,
          investments: true,
          earn: true,
        },
      });

      // Keep your schema unchanged: record as internal transfer with meta
      await tx.tx.create({
        data: {
          walletId: user.wallet.id,
          title: `Swap — ${from.toUpperCase()} → ${to.toUpperCase()}`,
          type: TxType.TRANSFER,
          amount: 0,
          currency: fiat,
          status: TxStatus.SUCCESS,
          meta: { kind: "SWAP", from, to, amount },
        },
      });

      return updated;
    });

    return NextResponse.json(
      { ok: true, buckets: bucketsToNumbers(updatedWallet) },
      { headers: { "cache-control": "no-store" } }
    );
  } catch (e) {
    const msg = e?.message || "Swap failed";
    return NextResponse.json(
      { ok: false, error: msg },
      { status: msg === "Insufficient funds" ? 400 : 500 }
    );
  }
}
