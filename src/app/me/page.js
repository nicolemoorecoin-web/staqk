import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import prisma from "../../lib/prisma";
import MeClient from "./MeClient";

export default async function MePage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) redirect("/login?next=/me");

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      language: true,
      fiatCurrency: true,
    },
  });

  if (!user?.id) redirect("/login?next=/me");

  const lastTx = await prisma.tx.findFirst({
    where: { wallet: { userId: user.id } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: { type: true, amount: true, currency: true, createdAt: true },
  });

  let notifText = null;
  if (lastTx?.type === "DEPOSIT") {
    const cur = String(lastTx.currency || user.fiatCurrency || "USD").toUpperCase();
    const name = user?.name || user?.email?.split("@")[0] || "You";

    notifText = `${name} made a deposit of ${formatMoney(Number(lastTx.amount || 0), cur)}`;
  }

  return (
    <MeClient
      initialName={user.name || ""}
      initialEmail={user.email || ""}
      initialLanguage={user.language || "en"}
      initialCurrency={user.fiatCurrency || "USD"}
      notifText={notifText}
    />
  );
}

function formatMoney(n, currency = "USD") {
  try {
    return Number(n || 0).toLocaleString(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    });
  } catch {
    return `${Number(n || 0).toFixed(2)} ${currency}`;
  }
}
