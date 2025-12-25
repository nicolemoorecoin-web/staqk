import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function adminAllowList() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

async function isAdminSessionOrDb(session) {
  const email = (session?.user?.email || "").toLowerCase();
  if (!email) return false;

  // fast paths
  if (session?.user?.role === "ADMIN") return true;
  if (adminAllowList().includes(email)) return true;

  // DB fallback
  const me = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  return me?.role === "ADMIN";
}

async function getUserIdFromSession(session) {
  const direct = session?.user?.id;
  if (direct) return direct;

  const email = session?.user?.email;
  if (!email) return null;

  const u = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
  return u?.id || null;
}

function normalizeAttachments(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .map((a) => {
      if (!a?.url) return null;
      const mime = a.mime || "";
      const kind = a.kind || (mime.startsWith("image/") ? "IMAGE" : "FILE");
      return {
        url: String(a.url),
        name: a.name ? String(a.name) : null,
        mime: mime ? String(mime) : null,
        size: Number.isFinite(Number(a.size)) ? Number(a.size) : null,
        kind: kind === "IMAGE" ? "IMAGE" : "FILE",
      };
    })
    .filter(Boolean);
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get("threadId");
    const after = searchParams.get("after");

    if (!threadId) {
      return NextResponse.json({ ok: false, error: "Missing threadId" }, { status: 400 });
    }

    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      select: { id: true, userId: true, status: true },
    });

    if (!thread) return NextResponse.json({ ok: false, error: "Thread not found" }, { status: 404 });

    const myId = await getUserIdFromSession(session);
    const admin = await isAdminSessionOrDb(session);

    const allowed = admin || (myId && thread.userId === myId);
    if (!allowed) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    const where = {
      threadId,
      ...(after ? { createdAt: { gt: new Date(after) } } : {}),
    };

    const items = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: 120,
      include: { attachments: true },
    });

    return NextResponse.json({ ok: true, items }, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    if (e?.code === "P2021") {
      return NextResponse.json(
        {
          ok: false,
          error: "Chat tables are missing in your database. Run: npx prisma migrate dev --name chat_init",
        },
        { status: 500 }
      );
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const threadId = body.threadId;
    const text = (body.text || "").trim();
    const attachments = normalizeAttachments(body.attachments);

    if (!threadId) return NextResponse.json({ ok: false, error: "Missing threadId" }, { status: 400 });
    if (!text && attachments.length === 0) {
      return NextResponse.json({ ok: false, error: "Empty message" }, { status: 400 });
    }

    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      select: { id: true, userId: true },
    });

    if (!thread) return NextResponse.json({ ok: false, error: "Thread not found" }, { status: 404 });

    const myId = await getUserIdFromSession(session);
    const admin = await isAdminSessionOrDb(session);

    const allowed = admin || (myId && thread.userId === myId);
    if (!allowed) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

    const sender = admin ? "SUPPORT" : "USER";

    const msg = await prisma.chatMessage.create({
      data: {
        threadId,
        sender,
        text: text || null,
        attachments: attachments.length ? { create: attachments } : undefined,
      },
      include: { attachments: true },
    });

    await prisma.chatThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ ok: true, message: msg }, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    if (e?.code === "P2021") {
      return NextResponse.json(
        {
          ok: false,
          error: "Chat tables are missing in your database. Run: npx prisma migrate dev --name chat_init",
        },
        { status: 500 }
      );
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
