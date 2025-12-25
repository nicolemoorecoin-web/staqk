import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function makeStaqksId() {
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `STAQK-${rnd}`;
}

function safeDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      username: true,
      staqksId: true,
      email: true,
      phone: true,
      birthdate: true,
      gender: true,
      weight: true,
      height: true,
      address: true,
      avatar: true,
    },
  });

  if (!me) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  // ensure staqksId exists (one-time)
  if (!me.staqksId) {
    const updated = await prisma.user.update({
      where: { email: session.user.email },
      data: { staqksId: makeStaqksId() },
      select: {
        name: true,
        username: true,
        staqksId: true,
        email: true,
        phone: true,
        birthdate: true,
        gender: true,
        weight: true,
        height: true,
        address: true,
        avatar: true,
      },
    });
    return NextResponse.json({ ok: true, profile: updated }, { headers: { "cache-control": "no-store" } });
  }

  return NextResponse.json({ ok: true, profile: me }, { headers: { "cache-control": "no-store" } });
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  // ✅ only allow editing these (Name/Email/STAQKS ID read-only)
  const next = {};

  if (body.username !== undefined) next.username = String(body.username || "").trim() || null;
  if (body.phone !== undefined) next.phone = String(body.phone || "").trim() || null;
  if (body.gender !== undefined) next.gender = String(body.gender || "").trim() || null;
  if (body.weight !== undefined) next.weight = String(body.weight || "").trim() || null;
  if (body.height !== undefined) next.height = String(body.height || "").trim() || null;
  if (body.address !== undefined) next.address = String(body.address || "").trim() || null;
  if (body.avatar !== undefined) next.avatar = String(body.avatar || "").trim() || null;

  if (body.birthdate !== undefined) {
    const d = safeDate(body.birthdate);
    next.birthdate = d; // can be null
  }

  if (Object.keys(next).length === 0) {
    return NextResponse.json({ ok: false, error: "No changes provided" }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { email: session.user.email },
      data: next,
      select: {
        name: true,
        username: true,
        staqksId: true,
        email: true,
        phone: true,
        birthdate: true,
        gender: true,
        weight: true,
        height: true,
        address: true,
        avatar: true,
      },
    });

    return NextResponse.json(
      { ok: true, profile: updated },
      { headers: { "cache-control": "no-store" } }
    );
  } catch (e) {
    // Prisma unique constraint (username or staqksId collisions)
    if (e?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Username already taken" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "Update failed" }, { status: 500 });
  }
}
