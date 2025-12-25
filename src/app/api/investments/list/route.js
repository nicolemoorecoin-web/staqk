// src/app/api/investments/list/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

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
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { ok: false, investments: [], error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { wallet: true },
    });

    if (!user?.wallet?.id) {
      return NextResponse.json({ ok: true, investments: [] });
    }

    const investments = await prisma.investment.findMany({
      where: { walletId: user.wallet.id },
      orderBy: { startTs: "desc" },
    });

    // Make decimals JSON-safe
    const clean = investments.map((iv) => ({
      ...iv,
      principal: num(iv.principal),
      balance: num(iv.balance),
      pnl: num(iv.pnl),
    }));

    return NextResponse.json({ ok: true, investments: clean });
  } catch (err) {
    console.error("investments/list error:", err?.message || err);
    return NextResponse.json(
      { ok: false, investments: [], error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
