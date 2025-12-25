// src/app/api/me/prefs/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";


export const dynamic = "force-dynamic";
export const revalidate = 0;

const ALLOWED_LANG = new Set(["en", "fr", "es", "de", "ar", "zh"]);
const ALLOWED_FIAT = new Set(["USD", "EUR", "GBP", "CAD", "AUD", "NGN"]);

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const language = body?.language ? String(body.language).toLowerCase() : null;
  const fiatCurrency = body?.fiatCurrency ? String(body.fiatCurrency).toUpperCase() : null;

  const data = {};
  if (language && ALLOWED_LANG.has(language)) data.language = language;
  if (fiatCurrency && ALLOWED_FIAT.has(fiatCurrency)) data.fiatCurrency = fiatCurrency;

  if (!Object.keys(data).length) {
    return NextResponse.json({ ok: false, error: "Nothing to update" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data,
    select: { id: true, language: true, fiatCurrency: true },
  });

  return NextResponse.json({ ok: true, user }, { headers: { "cache-control": "no-store" } });
}
