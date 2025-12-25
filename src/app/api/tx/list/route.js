// src/app/api/investments/list/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

const num = (v) => Number(v || 0);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1) Find this user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet) {
      return NextResponse.json({
        walletId: null,
        investments: [],
        totals: { principal: 0, current: 0, pnl: 0 },
      });
    }

    // 2) All investments for this wallet
    const investments = await prisma.investment.findMany({
      where: { walletId: wallet.id },
      orderBy: [{ startTs: "asc" }, { id: "asc" }],
    });

    // 3) Totals for the dashboard
    const totals = investments.reduce(
      (acc, iv) => {
        acc.principal += num(iv.principal);
        acc.current += num(iv.balance);
        acc.pnl += num(iv.pnl);
        return acc;
      },
      { principal: 0, current: 0, pnl: 0 }
    );

    return NextResponse.json({
      walletId: wallet.id,
      investments,
      totals,
    });
  } catch (err) {
    console.error("GET /api/investments/list failed", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
