import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import prisma from "../../../../../lib/prisma";
import { TxStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = (session?.user?.email || "").toLowerCase();
  const isAdmin =
    session?.user?.role === "ADMIN" || ADMIN_EMAILS.includes(email);

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tx = await prisma.tx.findMany({
    where: { status: TxStatus.PENDING },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      amount: true,
      currency: true,
      status: true,
      asset: true,
      network: true,
      address: true,
      createdAt: true,
      wallet: {
        select: {
          id: true,
          user: { select: { id: true, email: true, name: true, username: true } },
        },
      },
    },
  });

  return NextResponse.json({ ok: true, items: tx }, { headers: { "cache-control": "no-store" } });
}
