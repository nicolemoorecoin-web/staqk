import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import prisma from "../../../../../lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = (session?.user?.email || "").toLowerCase();

  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const me = email
    ? await prisma.user.findUnique({ where: { email }, select: { role: true } })
    : null;

  const isAdmin = session?.user?.role === "ADMIN" || me?.role === "ADMIN" || allow.includes(email);

  if (!isAdmin) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const threads = await prisma.chatThread.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: {
      user: { select: { id: true, email: true, name: true, username: true } },
      messages: {
        orderBy: [{ createdAt: "desc" }],
        take: 1,
        select: { id: true, text: true, sender: true, createdAt: true },
      },
    },
    take: 200,
  });

  return NextResponse.json({ ok: true, items: threads }, { headers: { "cache-control": "no-store" } });
}
