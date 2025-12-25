// src/app/admin/investments/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { redirect } from "next/navigation";
import prisma from "../../../lib/prisma";
import AdminInvestmentsClient from "./AdminInvestmentsClient";

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

export default async function AdminInvestmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login?next=/admin/investments");
  }

  // Enforce admin role
  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!me || me.role !== "ADMIN") {
    redirect("/home");
  }

  // ✅ Fetch ALL investments with owner details
  const rows = await prisma.investment.findMany({
    orderBy: [{ startTs: "desc" }],
    include: {
      wallet: {
        include: {
          user: true,
        },
      },
    },
    take: 500,
  });

  const initialRows = rows.map((iv) => ({
    id: iv.id,
    walletId: iv.walletId,
    clientName: iv.wallet?.user?.name || iv.wallet?.user?.email || "—",
    clientEmail: iv.wallet?.user?.email || "",
    name: iv.name,
    strategy: iv.strategy,
    principal: num(iv.principal),
    balance: num(iv.balance),
    pnl: num(iv.pnl),
    status: iv.status,
    startTs: iv.startTs ? iv.startTs.toISOString() : null,
    lastUpdate: iv.lastUpdate ? iv.lastUpdate.toISOString() : null,
    currency: iv.currency || "USD",
  }));

  return <AdminInvestmentsClient initialRows={initialRows} />;
}
