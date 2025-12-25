// src/app/api/investments/pnl/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import prisma from "../../../../../lib/prisma";
import { Prisma, TxStatus, TxType } from "@prisma/client";

const D = (v) => new Prisma.Decimal(String(v ?? 0));

const numOut = (v) => {
  if (v == null) return 0;
  if (typeof v === "object" && typeof v.toString === "function") {
    const n = Number(v.toString());
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // Ensure admin
    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, fiatCurrency: true, wallet: { select: { id: true } } },
    });

    if (!me || me.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const investmentId = String(body.investmentId || "").trim();

    // ✅ accept both keys
    const deltaRaw = body.deltaPnl ?? body.delta;

    const note = String(body.note || "").trim();

    if (!investmentId) {
      return NextResponse.json({ ok: false, error: "investmentId is required" }, { status: 400 });
    }

    let delta;
    try {
      delta = D(deltaRaw);
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid delta" }, { status: 400 });
    }

    if (delta.eq(0)) {
      return NextResponse.json({ ok: false, error: "Delta must be non-zero" }, { status: 400 });
    }

    const fiat = String(me.fiatCurrency || "USD").toUpperCase();

    const { updatedIv, updatedWallet, appliedNumber } = await prisma.$transaction(async (tx) => {
      const iv = await tx.investment.findUnique({
        where: { id: investmentId },
        include: { wallet: true },
      });

      if (!iv) throw new Error("Investment not found");
      if (!iv.wallet) throw new Error("Wallet not found for investment");

      const curBal = D(iv.balance);
      const curPnl = D(iv.pnl);
      const curWalletInv = D(iv.wallet.investments);

      // Clamp: investment.balance cannot go below 0
      let applied = delta;
      let nextBal = curBal.plus(delta);

      if (nextBal.lt(0)) {
        applied = curBal.neg();
        nextBal = D(0);
      }

      const nextPnl = curPnl.plus(applied);

      // Move wallet investment bucket with profit/loss
      const nextWalletInv = curWalletInv.plus(applied);
      if (nextWalletInv.lt(0)) throw new Error("Wallet investments would go below 0");

      const updatedIv = await tx.investment.update({
        where: { id: investmentId },
        data: {
          balance: nextBal,
          pnl: nextPnl,
        },
      });

      const updatedWallet = await tx.wallet.update({
        where: { id: iv.walletId },
        data: { investments: nextWalletInv },
        select: { cash: true, crypto: true, staking: true, investments: true, earn: true },
      });

      const appliedNumber = numOut(applied);

      // ✅ record tx for profit/loss (shows on /transactions)
      if (appliedNumber !== 0) {
        await tx.tx.create({
          data: {
            walletId: iv.walletId,
            title: `Investment P&L — ${updatedIv.name}`,
            type: appliedNumber >= 0 ? TxType.DEPOSIT : TxType.WITHDRAW,
            amount: Math.abs(appliedNumber),
            currency: fiat,
            status: TxStatus.SUCCESS,
            notes: note || null,
            meta: {
              kind: "INVEST_PNL",
              investmentId,
              delta: appliedNumber,
              name: updatedIv.name,
              strategy: updatedIv.strategy,
            },
          },
        });
      }

      return { updatedIv, updatedWallet, appliedNumber };
    });

    return NextResponse.json({
      ok: true,
      investment: {
        ...updatedIv,
        principal: numOut(updatedIv.principal),
        balance: numOut(updatedIv.balance),
        pnl: numOut(updatedIv.pnl),
      },
      applied: appliedNumber,
      buckets: {
        cash: numOut(updatedWallet.cash),
        crypto: numOut(updatedWallet.crypto),
        staking: numOut(updatedWallet.staking),
        investments: numOut(updatedWallet.investments),
        earn: numOut(updatedWallet.earn),
      },
    });
  } catch (err) {
    console.error("investments/pnl error:", err?.message || err);
    return NextResponse.json({ ok: false, error: err?.message || "Server error" }, { status: 500 });
  }
}
