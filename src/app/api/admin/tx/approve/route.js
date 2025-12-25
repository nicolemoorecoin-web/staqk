import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import prisma from "../../../../../lib/prisma";
import { TxStatus, TxType } from "@prisma/client";

const num = (v) => Number(v || 0);
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const email = (session?.user?.email || "").toLowerCase();
  const isAdmin =
    session?.user?.role === "ADMIN" || ADMIN_EMAILS.includes(email);

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { txId } = await req.json().catch(() => ({}));
  if (!txId) return NextResponse.json({ error: "Missing txId" }, { status: 400 });

  const tx = await prisma.tx.findUnique({
    where: { id: txId },
    include: { wallet: true },
  });
  if (!tx) return NextResponse.json({ error: "Tx not found" }, { status: 404 });
  if (tx.status !== TxStatus.PENDING) {
    return NextResponse.json({ error: `Cannot approve tx in status ${tx.status}` }, { status: 409 });
  }

  const w = tx.wallet;
  const data = {};

  if (tx.type === TxType.DEPOSIT) {
    data.crypto = num(w.crypto) + num(tx.amount);
  } else if (tx.type === TxType.WITHDRAW) {
    data.crypto = num(w.crypto) + num(tx.amount); // amount is negative
    if (data.crypto < 0) data.crypto = 0;
  }
  if (Object.keys(data).length) {
    await prisma.wallet.update({ where: { id: w.id }, data });
  }

  await prisma.tx.update({ where: { id: tx.id }, data: { status: TxStatus.SUCCESS } });
  return NextResponse.json({ ok: true });
}
