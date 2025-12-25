import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import prisma from "../../../../../lib/prisma";
import { TxStatus } from "@prisma/client";

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

  const { txId, reason } = await req.json().catch(() => ({}));
  if (!txId) return NextResponse.json({ error: "Missing txId" }, { status: 400 });

  const tx = await prisma.tx.findUnique({ where: { id: txId } });
  if (!tx) return NextResponse.json({ error: "Tx not found" }, { status: 404 });
  if (tx.status !== TxStatus.PENDING) {
    return NextResponse.json({ error: `Cannot reject tx in status ${tx.status}` }, { status: 409 });
  }

  await prisma.tx.update({
    where: { id: txId },
    data: { status: TxStatus.FAILED, notes: reason ?? tx.notes },
  });

  return NextResponse.json({ ok: true });
}
