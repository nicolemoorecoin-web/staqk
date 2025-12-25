// src/app/api/reports/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

const num = (v) => {
  if (v == null) return 0;
  if (typeof v === "object" && typeof v.toString === "function") {
    const n = Number(v.toString());
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const asISODate = (d) => new Date(d).toISOString().slice(0, 10);

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    // Filters
    const from = searchParams.get("from") || ""; // yyyy-mm-dd
    const to = searchParams.get("to") || "";     // yyyy-mm-dd
    const asset = (searchParams.get("asset") || "All").trim();
    const status = (searchParams.get("status") || "All").trim();

    // Find user + wallet
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { wallet: true },
    });

    if (!user?.wallet?.id) {
      return NextResponse.json({
        ok: true,
        stats: { totalBalance: 0, investmentsPnl: 0, topAsset: "—" },
        allocation: { cash: 0, crypto: 0, staking: 0, investments: 0 },
        series: [],
        rows: [],
        assets: ["All"],
        statuses: ["All", "PENDING", "SUCCESS", "FAILED"],
      });
    }

    const wallet = user.wallet;

    // Wallet allocation (Option A: Earn mirrors Investments at UI level, not here)
    const allocation = {
      cash: num(wallet.cash),
      crypto: num(wallet.crypto),
      staking: num(wallet.staking),
      investments: num(wallet.investments),
    };

    const totalBalance =
      allocation.cash + allocation.crypto + allocation.staking + allocation.investments;

    // Build TX query
    const where = {
      walletId: wallet.id,
    };

    if (from) {
      where.createdAt = { ...(where.createdAt || {}), gte: new Date(from + "T00:00:00.000Z") };
    }
    if (to) {
      where.createdAt = { ...(where.createdAt || {}), lte: new Date(to + "T23:59:59.999Z") };
    }
    if (status !== "All") {
      where.status = status; // PENDING|SUCCESS|FAILED
    }

    // Asset filter: we treat "asset" as tx.asset if present, else tx.currency.
    // We'll filter after fetch so it still works even when tx.asset is null.
    const txs = await prisma.tx.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 500,
    });

    const cleaned = txs.map((t) => {
      const a = num(t.amount);
      const derivedAsset = (t.asset || t.currency || "USD").toUpperCase();
      return {
        id: t.id,
        date: t.createdAt.toISOString(),
        dateLabel: asISODate(t.createdAt),
        type: t.type, // DEPOSIT|WITHDRAW|TRANSFER
        asset: derivedAsset,
        amount: a,
        status: t.status, // PENDING|SUCCESS|FAILED
        title: t.title || "",
        network: t.network || "",
        notes: t.notes || "",
      };
    });

    const rows = cleaned.filter((r) => asset === "All" || r.asset === asset.toUpperCase());

    // Investment P&L (current total P&L; monthly history not stored yet)
    const invs = await prisma.investment.findMany({
      where: { walletId: wallet.id },
      select: { pnl: true },
    });
    const investmentsPnl = invs.reduce((s, iv) => s + num(iv.pnl), 0);

    // Top asset (by absolute volume in filtered rows)
    const assetVolume = new Map();
    for (const r of rows) {
      const v = Math.abs(Number(r.amount) || 0);
      assetVolume.set(r.asset, (assetVolume.get(r.asset) || 0) + v);
    }
    let topAsset = "—";
    let topVol = 0;
    for (const [k, v] of assetVolume.entries()) {
      if (v > topVol) {
        topVol = v;
        topAsset = k;
      }
    }

    // Earnings over time series (net flow per day from SUCCESS tx only)
    const daily = new Map(); // yyyy-mm-dd -> net
    for (const r of rows) {
      if (r.status !== "SUCCESS") continue;
      const key = r.dateLabel;
      daily.set(key, (daily.get(key) || 0) + (Number(r.amount) || 0));
    }
    const series = Array.from(daily.entries())
      .sort((a, b) => (a[0] > b[0] ? 1 : -1))
      .map(([date, value]) => ({ date, value }));

    // Dropdown options
    const assets = ["All", ...Array.from(new Set(cleaned.map((r) => r.asset)))].sort();
    const statuses = ["All", "PENDING", "SUCCESS", "FAILED"];

    return NextResponse.json({
      ok: true,
      stats: { totalBalance, investmentsPnl, topAsset },
      allocation,
      series,
      rows,
      assets,
      statuses,
    });
  } catch (err) {
    console.error("reports GET error:", err?.message || err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
