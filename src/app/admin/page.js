// src/app/admin/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import prisma  from "../../lib/prisma";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login?next=/admin");
  }

  // Enforce admin role from DB
  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!me || me.role !== "ADMIN") {
    redirect("/home");
  }

  // Pending transactions (any type)
  const pending = await prisma.tx.findMany({
    where: { status: "PENDING" },
    include: {
      wallet: {
        include: { user: true },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 100,
  });

  const safePending = pending.map((t) => ({
    id: t.id,
    type: t.type,
    status: t.status,
    title: t.title,
    amount: Number(t.amount),
    currency: t.currency,
    asset: t.asset,
    network: t.network,
    notes: t.notes,
    createdAt: t.createdAt.toISOString(),
    userEmail: t.wallet.user.email,
    userName: t.wallet.user.name,
  }));

  const addresses = await prisma.adminAddress.findMany({
    orderBy: [{ asset: "asc" }, { network: "asc" }],
  });

  const safeAddresses = addresses.map((a) => ({
    id: a.id,
    asset: a.asset,
    network: a.network,
    address: a.address,
    memo: a.memo,
    active: a.active,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <AdminClient
      me={{ id: me.id, email: me.email, name: me.name }}
      pending={safePending}
      addresses={safeAddresses}
    />
  );
}
