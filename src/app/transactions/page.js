// C:\staqks active\src\app\transactions\page.js

import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import TxListClient from "./TxListClient";

// ✅ Use your shared prisma singleton if you have it
// (recommended so you don't create PrismaClient per request)
import prisma from "../../lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Next 15 (extra no-cache safety)
export const fetchCache = "force-no-store";

/** Decimal-safe stringify (never returns NaN) */
function decToString(v) {
  if (v == null) return "0";
  if (typeof v === "string") return v;
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "0";
  if (typeof v === "object") {
    if (typeof v.toString === "function") return v.toString();
    if (typeof v.valueOf === "function") return String(v.valueOf());
  }
  try {
    return String(v);
  } catch {
    return "0";
  }
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?next=/transactions");

  // ✅ Prefer userId (more reliable than email)
  const where = session?.user?.id
    ? { wallet: { userId: session.user.id } }
    : { wallet: { user: { email: session.user.email } } };

  const items = await prisma.tx.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 200,
  });

  // ✅ IMPORTANT:
  // Send amount as STRING so Prisma Decimal never becomes NaN/0 in server mapping.
  // Your TxListClient already has robust parsing.
  const safe = items.map((t) => ({
    id: t.id,
    walletId: t.walletId,

    title: t.title,
    type: t.type,
    status: t.status,

    // ✅ Decimal-safe
    amount: decToString(t.amount),

    currency: t.currency,
    asset: t.asset,
    network: t.network,
    address: t.address,
    receiptUrl: t.receiptUrl,
    notes: t.notes,
    meta: t.meta ?? null,

    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  return <TxListClient initialItems={safe} />;
}
