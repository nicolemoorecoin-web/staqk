// SERVER COMPONENT
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";        // <-- adjust if your path differs
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import NotificationsClient from "./NotificationsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const prisma = new PrismaClient();

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?next=/notifications");

  // fetch ONLY this user's transactions
  const tx = await prisma.tx.findMany({
    where: { wallet: { userId: session.user.id } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 50,
  });

  return <NotificationsClient initialTx={tx} />;
}
