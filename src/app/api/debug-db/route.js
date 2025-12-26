import { NextResponse } from "next/server";

function safeParse(urlStr) {
  try {
    const u = new URL(urlStr);
    return {
      ok: true,
      protocol: u.protocol,
      host: u.hostname,
      port: u.port,
      pathname: u.pathname,
      username: u.username ? u.username.slice(0, 3) + "***" : "",
      hasNewline: /\n|\r/.test(urlStr),
      startsWithQuote: /^["']/.test(urlStr),
      endsWithQuote: /["']$/.test(urlStr),
      length: urlStr.length,
    };
  } catch (e) {
    return { ok: false, parseError: String(e?.message || e) };
  }
}

export async function GET() {
  const DATABASE_URL = process.env.DATABASE_URL || "";
  const DIRECT_URL = process.env.DIRECT_URL || "";

  return NextResponse.json({
    env: {
      has_DATABASE_URL: !!DATABASE_URL,
      has_DIRECT_URL: !!DIRECT_URL,
      DATABASE_URL: safeParse(DATABASE_URL),
      DIRECT_URL: safeParse(DIRECT_URL),
    },
  });
}
