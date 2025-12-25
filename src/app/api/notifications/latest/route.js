import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Very simple example:
 * - if you have a Notification model, return the latest
 * - otherwise, derive a message from latest Tx
 */
export async function GET() {
  // try from a hypothetical Notification model
  try {
    const notif = await prisma.notification.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (notif) return NextResponse.json({ message: notif.message });
  } catch (_) {}

  // fallback: craft a message from latest Tx
  const tx = await prisma.tx.findFirst({
    orderBy: { createdAt: "desc" },
    include: { wallet: { include: { user: true } } },
  });

  if (tx) {
    const who = tx.wallet?.user?.name || tx.wallet?.user?.email || "A user";
    const verb = tx.type.toLowerCase();
    return NextResponse.json({
      message: `${who} made a ${verb} of ${tx.amount} ${tx.currency}`,
    });
  }

  return NextResponse.json({ message: "Welcome to STAQK 🚀" });
}
