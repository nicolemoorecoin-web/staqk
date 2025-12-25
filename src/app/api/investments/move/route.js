// src/app/api/investments/move/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { TxStatus, TxType } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const num = (v) => {
  if (v == null) return 0;
  if (typeof v === "object" && typeof v.toString === "function") {
    const n = Number(v.toString());
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const getInvestmentId = (body) => {
  const raw = body?.investmentId ?? body?.id ?? "";
  const s = String(raw).trim();
  return s.length ? s : null;
};

function bucketLabel(b) {
  return String(b || "").trim().toUpperCase();
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || body.kind || "").toUpperCase();

    const amount = num(body.amount);
    const delta = num(body.delta);

    const needsAmount = ["START", "FUND", "TOPUP", "WITHDRAW", "UNFUND"].includes(action);
    if (needsAmount && (!amount || amount <= 0)) {
      return NextResponse.json({ ok: false, error: "Invalid amount" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { wallet: true },
    });

    if (!user?.wallet) {
      return NextResponse.json({ ok: false, error: "Wallet not found" }, { status: 404 });
    }

    const walletId = user.wallet.id;
    const fiat = String(user.fiatCurrency || "USD").toUpperCase();

    const result = await prisma.$transaction(async (tx) => {
      const w = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!w) throw new Error("Wallet not present");

      const buckets = {
        cash: num(w.cash),
        crypto: num(w.crypto),
        staking: num(w.staking),
        earn: num(w.earn),
        investments: num(w.investments ?? 0),
      };

      // Create a ledger row for /transactions
      const makeTx = async ({ title, type, amount, meta }) => {
        await tx.tx.create({
          data: {
            walletId,
            title,
            type,
            amount: Number(amount || 0),
            currency: fiat,
            status: TxStatus.SUCCESS,
            meta: meta || {},
          },
        });
      };

      /* ---------------- START / FUND ---------------- */
      if (["START", "FUND"].includes(action)) {
        const sourceBucket = String(body.sourceBucket || "cash");
        if (!["cash", "crypto"].includes(sourceBucket)) throw new Error("Invalid sourceBucket");
        if (buckets[sourceBucket] < amount) throw new Error("Insufficient balance in source bucket");

        const productId = String(body.productId || "").trim();
        if (!productId) throw new Error("productId is required");

        const productName = String(body.productName || "").trim() || "Managed Account";
        const strategy = String(body.strategy || "Strategy");
        const currency = String(body.currency || fiat);

        const investment = await tx.investment.create({
          data: {
            walletId,
            productId,
            name: productName,
            strategy,
            currency,
            principal: amount,
            balance: amount,
            pnl: 0,
            status: "active",
            startTs: new Date(),
          },
        });

        // move source -> investments
        buckets[sourceBucket] -= amount;
        buckets.investments += amount;

        await tx.wallet.update({
          where: { id: walletId },
          data: {
            cash: buckets.cash,
            crypto: buckets.crypto,
            staking: buckets.staking,
            earn: buckets.earn,
            investments: buckets.investments,
          },
        });

        // ✅ NOT "Swap" anymore. Record as Investment with real negative outflow.
        await makeTx({
          title: `Investment - ${productName}`,
          type: TxType.TRANSFER,
          amount: -Math.abs(amount),
          meta: {
            kind: "INVEST_START",
            from: sourceBucket,
            to: "investments",
            amount,
            investmentId: investment.id,
            productId,
            productName,
            strategy,
          },
        });

        return { buckets, investment };
      }

      /* ---------------- TOPUP ---------------- */
      if (action === "TOPUP") {
        const sourceBucket = String(body.sourceBucket || "cash");
        if (!["cash", "crypto"].includes(sourceBucket)) throw new Error("Invalid sourceBucket");

        const investmentId = getInvestmentId(body);
        if (!investmentId) throw new Error("investmentId is required");

        const iv = await tx.investment.findUnique({ where: { id: investmentId } });
        if (!iv || iv.walletId !== walletId) throw new Error("Investment not found");

        if (buckets[sourceBucket] < amount) throw new Error("Insufficient balance in source bucket");

        buckets[sourceBucket] -= amount;
        buckets.investments += amount;

        const updatedIv = await tx.investment.update({
          where: { id: investmentId },
          data: {
            principal: num(iv.principal) + amount,
            balance: num(iv.balance) + amount,
          },
        });

        await tx.wallet.update({
          where: { id: walletId },
          data: {
            cash: buckets.cash,
            crypto: buckets.crypto,
            staking: buckets.staking,
            earn: buckets.earn,
            investments: buckets.investments,
          },
        });

        await makeTx({
          title: `Investment Top-up - ${updatedIv.name || "Managed Account"}`,
          type: TxType.TRANSFER,
          amount: -Math.abs(amount),
          meta: {
            kind: "INVEST_TOPUP",
            from: sourceBucket,
            to: "investments",
            amount,
            investmentId,
            name: updatedIv.name,
            strategy: updatedIv.strategy,
          },
        });

        return { buckets, investment: updatedIv };
      }

      /* ---------------- WITHDRAW ALL ---------------- */
      if (action === "WITHDRAW_ALL") {
        const investmentId = getInvestmentId(body);
        if (!investmentId) throw new Error("investmentId is required");

        const targetBucket = String(body.targetBucket || "cash");
        if (!["cash", "crypto", "earn"].includes(targetBucket)) throw new Error("Invalid targetBucket");

        const iv = await tx.investment.findUnique({ where: { id: investmentId } });
        if (!iv || iv.walletId !== walletId) throw new Error("Investment not found");

        const full = num(iv.balance);
        if (full <= 0) throw new Error("No balance to withdraw");

        buckets.investments -= full;
        buckets[targetBucket] = num(buckets[targetBucket]) + full;

        const updatedIv = await tx.investment.update({
          where: { id: investmentId },
          data: { balance: 0, status: "closed" },
        });

        await tx.wallet.update({
          where: { id: walletId },
          data: {
            cash: buckets.cash,
            crypto: buckets.crypto,
            staking: buckets.staking,
            earn: buckets.earn,
            investments: buckets.investments,
          },
        });

        // ✅ Show as "Withdrawal" (not Swap). We keep type=WITHDRAW but amount POSITIVE
        // so UI can display +$ for the cash inflow, while still filtering under "WITHDRAW".
        await makeTx({
          title: `Withdrawal - INVESTMENTS -> ${bucketLabel(targetBucket)}`,
          type: TxType.WITHDRAW,
          amount: Math.abs(full),
          meta: {
            kind: "INVEST_WITHDRAW_ALL",
            from: "investments",
            to: targetBucket,
            amount: full,
            investmentId,
            name: updatedIv.name,
            strategy: updatedIv.strategy,
          },
        });

        return { buckets, investment: updatedIv };
      }

      /* ---------------- WITHDRAW / UNFUND ---------------- */
      if (["WITHDRAW", "UNFUND"].includes(action)) {
        const investmentId = getInvestmentId(body);
        if (!investmentId) throw new Error("investmentId is required");

        const targetBucket = String(body.targetBucket || "cash");
        if (!["cash", "crypto", "earn"].includes(targetBucket)) throw new Error("Invalid targetBucket");

        const iv = await tx.investment.findUnique({ where: { id: investmentId } });
        if (!iv || iv.walletId !== walletId) throw new Error("Investment not found");

        if (num(iv.balance) < amount) throw new Error("Insufficient investment balance");

        buckets.investments -= amount;
        buckets[targetBucket] = num(buckets[targetBucket]) + amount;

        const newBal = num(iv.balance) - amount;

        const updatedIv = await tx.investment.update({
          where: { id: investmentId },
          data: {
            balance: newBal,
            status: newBal <= 0 ? "closed" : iv.status,
          },
        });

        await tx.wallet.update({
          where: { id: walletId },
          data: {
            cash: buckets.cash,
            crypto: buckets.crypto,
            staking: buckets.staking,
            earn: buckets.earn,
            investments: buckets.investments,
          },
        });

        await makeTx({
          title: `Withdrawal - INVESTMENTS -> ${bucketLabel(targetBucket)}`,
          type: TxType.WITHDRAW,
          amount: Math.abs(amount),
          meta: {
            kind: "INVEST_WITHDRAW",
            from: "investments",
            to: targetBucket,
            amount,
            investmentId,
            name: updatedIv.name,
            strategy: updatedIv.strategy,
          },
        });

        return { buckets, investment: updatedIv };
      }

      /* ---------------- PNL ---------------- */
      if (action === "PNL") {
        const investmentId = getInvestmentId(body);
        if (!investmentId) throw new Error("investmentId is required");

        const iv = await tx.investment.findUnique({ where: { id: investmentId } });
        if (!iv || iv.walletId !== walletId) throw new Error("Investment not found");

        const ivBal = num(iv.balance);
        const ivPnl = num(iv.pnl);

        const unclampedNewBal = ivBal + delta;
        const newBal = unclampedNewBal < 0 ? 0 : unclampedNewBal;

        const appliedDelta = newBal - ivBal;

        const newWalletInv = num(buckets.investments) + appliedDelta;
        if (newWalletInv < 0) throw new Error("Wallet investments would go negative");

        buckets.investments = newWalletInv;

        const updatedIv = await tx.investment.update({
          where: { id: investmentId },
          data: {
            balance: newBal,
            pnl: ivPnl + appliedDelta,
            status: newBal <= 0 ? "closed" : iv.status,
          },
        });

        await tx.wallet.update({
          where: { id: walletId },
          data: { investments: buckets.investments },
        });

        if (appliedDelta !== 0) {
          await makeTx({
            title: `Investment P&L - ${updatedIv.name}`,
            type: appliedDelta >= 0 ? TxType.DEPOSIT : TxType.WITHDRAW,
            amount: Math.abs(appliedDelta),
            meta: {
              kind: "INVEST_PNL",
              investmentId,
              delta: appliedDelta,
              name: updatedIv.name,
              strategy: updatedIv.strategy,
            },
          });
        }

        return { buckets, investment: updatedIv, appliedDelta };
      }

      throw new Error("Unknown action");
    });

    const totalUsd = Object.values(result.buckets).reduce((s, v) => s + num(v), 0);
    return NextResponse.json({ ok: true, ...result, totalUsd }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    console.error("investments/move error:", err?.message || err);
    return NextResponse.json({ ok: false, error: err?.message || "Server error" }, { status: 400 });
  }
}
