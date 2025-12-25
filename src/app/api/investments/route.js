import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

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
    return NextResponse.json({ ok: true, items: [] }, { headers: { "cache-control": "no-store" } });
  }

  const rows = await prisma.investment.findMany({
    where: { walletId: user.wallet.id },
    orderBy: { startTs: "desc" },
  });

  const items = rows.map((iv) => ({
    id: iv.id,
    walletId: iv.walletId,
    productId: iv.productId,
    name: iv.name,
    strategy: iv.strategy,
    currency: iv.currency,
    principal: num(iv.principal),
    balance: num(iv.balance),
    pnl: num(iv.pnl),
    status: iv.status,
    startTs: iv.startTs?.toISOString?.() || iv.startTs,
    lastUpdate: iv.lastUpdate?.toISOString?.() || iv.lastUpdate,
  }));

  return NextResponse.json(
    { ok: true, items },
    { headers: { "cache-control": "no-store" } }
  );
}
