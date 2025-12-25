// C:\staqks active\src\app\api\me\preferences\route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";


export const dynamic = "force-dynamic";
export const revalidate = 0;

const ALLOWED_LANG = new Set(["en", "fr", "es", "de", "ar", "zh"]);
const ALLOWED_FIAT = new Set(["USD", "EUR", "GBP", "AUD", "JPY", "CAD", "NGN"]);
const ALLOWED_CRYPTO = new Set(["BTC", "ETH", "USDT", "SOL"]);

function normalizeLanguage(v) {
  if (!v) return "en";
  const s = String(v).trim().toLowerCase();

  // legacy labels (if they ever exist)
  if (s === "english" || s === "en") return "en";
  if (s === "français" || s === "francais" || s === "french" || s === "fr") return "fr";
  if (s === "español" || s === "espanol" || s === "spanish" || s === "es") return "es";
  if (s === "deutsch" || s === "german" || s === "de") return "de";
  if (s === "العربية" || s === "arabic" || s === "ar") return "ar";
  if (s === "中文" || s === "chinese" || s === "zh") return "zh";

  if (ALLOWED_LANG.has(s)) return s;
  return "en";
}

function normUpper(v, fallback) {
  if (!v) return fallback;
  return String(v).trim().toUpperCase() || fallback;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      language: true,
      fiatCurrency: true,
      cryptoCurrency: true,
    },
  });

  const language = normalizeLanguage(me?.language);
  const fiatCurrency = normUpper(me?.fiatCurrency, "USD");
  const cryptoCurrency = normUpper(me?.cryptoCurrency, "BTC");

  return NextResponse.json(
    {
      ok: true,
      language,
      fiatCurrency: ALLOWED_FIAT.has(fiatCurrency) ? fiatCurrency : "USD",
      cryptoCurrency: ALLOWED_CRYPTO.has(cryptoCurrency) ? cryptoCurrency : "BTC",
    },
    { headers: { "cache-control": "no-store" } }
  );
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const next = {};

  if (body.language !== undefined) {
    const lang = normalizeLanguage(body.language);
    if (!ALLOWED_LANG.has(lang)) {
      return NextResponse.json({ ok: false, error: "Invalid language" }, { status: 400 });
    }
    next.language = lang;
  }

  if (body.fiatCurrency !== undefined) {
    const f = normUpper(body.fiatCurrency, "");
    if (!ALLOWED_FIAT.has(f)) {
      return NextResponse.json({ ok: false, error: "Invalid fiat currency" }, { status: 400 });
    }
    next.fiatCurrency = f;
  }

  if (body.cryptoCurrency !== undefined) {
    const c = normUpper(body.cryptoCurrency, "");
    if (!ALLOWED_CRYPTO.has(c)) {
      return NextResponse.json({ ok: false, error: "Invalid crypto currency" }, { status: 400 });
    }
    next.cryptoCurrency = c;
  }

  if (Object.keys(next).length === 0) {
    return NextResponse.json({ ok: false, error: "No changes provided" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { email: session.user.email },
    data: next,
    select: { language: true, fiatCurrency: true, cryptoCurrency: true },
  });

  return NextResponse.json(
    { ok: true, ...updated },
    { headers: { "cache-control": "no-store" } }
  );
}
