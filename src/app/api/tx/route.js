import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// always compute per-request; don't cache across users
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");

  const tx = await prisma.tx.findMany({
    where: {
      wallet: { userId: session.user.id },            // <- key line
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { id: "desc" },                           // use "createdAt" if you have it
  });

  return NextResponse.json(tx, { headers: { "cache-control": "no-store" } });
}
