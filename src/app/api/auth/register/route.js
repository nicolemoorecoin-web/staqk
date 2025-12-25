import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function makeStaqksId() {
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `STAQK-${rnd}`;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!name || !email || !password) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }
    if (!email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // block duplicate email
    const exists = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (exists) {
      return NextResponse.json({ ok: false, error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // try a few times in case staqksId collides (rare but possible)
    let created = null;
    for (let i = 0; i < 5; i++) {
      const staqksId = makeStaqksId();
      try {
        created = await prisma.user.create({
          data: {
            name,
            email,
            passwordHash,
            staqksId,
            // prefs defaults come from schema, but safe to be explicit
            language: "en",
            fiatCurrency: "USD",
            cryptoCurrency: "BTC",
            wallet: { create: {} },
          },
          select: {
            id: true,
            name: true,
            email: true,
            staqksId: true,
            language: true,
            fiatCurrency: true,
            cryptoCurrency: true,
          },
        });
        break;
      } catch (e) {
        // if unique collision, loop again
        const msg = String(e?.message || "");
        if (!msg.toLowerCase().includes("unique")) throw e;
      }
    }

    if (!created) {
      return NextResponse.json({ ok: false, error: "Could not create account" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, user: created }, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Register failed" },
      { status: 500 }
    );
  }
}
