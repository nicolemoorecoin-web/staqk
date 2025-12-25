// src/app/api/admin/investments/pnl/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import prisma from "../../../../../lib/prisma";

const num = (v) => {
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

    // Must be ADMIN
    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (!me || me.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const investmentId = String(body?.investmentId || "").trim();
    const delta = num(body?.delta);

    if (!investmentId) {
      return NextResponse.json({ ok: false, error: "investmentId is required" }, { status: 400 });
    }
    if (!Number.isFinite(delta) || delta === 0) {
      return NextResponse.json({ ok: false, error: "delta must be a non-zero number" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const iv = await tx.investment.findUnique({
        where: { id: investmentId },
        include: { wallet: { include: { user: true } } },
      });
      if (!iv) throw new Error("Investment not found");

      const walletId = iv.walletId;

      const w = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!w) throw new Error("Wallet not found");

      const oldBal = num(iv.balance);
      const oldPnl = num(iv.pnl);
      const oldWalletInv = num(w.investments);

      // Clamp: investment balance cannot go below 0
      const unclampedNewBal = oldBal + delta;
      const newBal = unclampedNewBal < 0 ? 0 : unclampedNewBal;

      // Effective applied delta (if we clamped)
      const appliedDelta = newBal - oldBal;

      // Update wallet investments bucket too
      const newWalletInv = oldWalletInv + appliedDelta;
      if (newWalletInv < 0) throw new Error("Wallet investments would go negative");

      const updatedIv = await tx.investment.update({
        where: { id: investmentId },
        data: {
          balance: newBal,
          pnl: oldPnl + appliedDelta,
          status: newBal <= 0 ? "closed" : iv.status,
        },
        include: { wallet: { include: { user: true } } },
      });

      await tx.wallet.update({
        where: { id: walletId },
        data: { investments: newWalletInv },
      });

      // Return a “client table ready” shape
      return {
        id: updatedIv.id,
        walletId: updatedIv.walletId,
        clientName: updatedIv.wallet?.user?.name || updatedIv.wallet?.user?.email || "—",
        clientEmail: updatedIv.wallet?.user?.email || "",
        name: updatedIv.name,
        strategy: updatedIv.strategy,
        principal: num(updatedIv.principal),
        balance: num(updatedIv.balance),
        pnl: num(updatedIv.pnl),
        status: updatedIv.status,
        startTs: updatedIv.startTs ? updatedIv.startTs.toISOString() : null,
        lastUpdate: updatedIv.lastUpdate ? updatedIv.lastUpdate.toISOString() : null,
        currency: updatedIv.currency || "USD",
        appliedDelta,
      };
    });

    return NextResponse.json({ ok: true, investment: result });
  } catch (err) {
    console.error("admin/investments/pnl error:", err?.message || err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
