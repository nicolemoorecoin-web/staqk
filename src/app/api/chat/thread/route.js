// src/app/api/chat/thread/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getUserIdFromSession(session) {
  const direct = session?.user?.id;
  if (direct) return direct;

  const email = session?.user?.email;
  if (!email) return null;

  const u = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return u?.id || null;
}

async function chatTablesExist() {
  // SQLite: check schema table exists
  const rows = await prisma.$queryRaw`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='ChatThread'
    LIMIT 1;
  `;
  return Array.isArray(rows) && rows.length > 0;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const userId = await getUserIdFromSession(session);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // If chat tables are missing, give a useful message instead of 500 crash
    const okTables = await chatTablesExist();
    if (!okTables) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Chat tables are missing in your database. Run: npx prisma migrate dev --name chat_init",
        },
        { status: 500 }
      );
    }

    // One OPEN thread per user (best-effort)
    let thread = await prisma.chatThread.findFirst({
      where: { userId, status: "OPEN" },
      orderBy: [{ updatedAt: "desc" }],
      select: { id: true, status: true, createdAt: true, updatedAt: true },
    });

    if (!thread) {
      thread = await prisma.chatThread.create({
        data: {
          userId,
          status: "OPEN",
          messages: {
            create: {
              sender: "SUPPORT",
              text: "Hello! How can we help you today?",
            },
          },
        },
        select: { id: true, status: true, createdAt: true, updatedAt: true },
      });
    }

    return NextResponse.json({ ok: true, thread }, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    // Prisma P2021 = missing table
    if (e?.code === "P2021") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Chat tables are missing in your database. Run: npx prisma migrate dev --name chat_init",
        },
        { status: 500 }
      );
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
