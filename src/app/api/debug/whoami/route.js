import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ session: null });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { wallet: true },
  });

  return NextResponse.json({
    session,
    walletId: user?.wallet?.id || null,
  }, { headers: { "cache-control": "no-store" } });
}
