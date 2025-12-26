// src/app/api/debug-db/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeParse(raw) {
  const s = (raw ?? "").toString();
  const out = {
    exists: !!s,
    length: s.length,
    startsWithQuote: s.startsWith('"') || s.startsWith("'"),
    endsWithQuote: s.endsWith('"') || s.endsWith("'"),
    hasNewline: s.includes("\n") || s.includes("\r"),
  };

  try {
    const u = new URL(s);
    out.ok = true;
    out.protocol = u.protocol;
    out.host = u.host;
    out.hostname = u.hostname;
    out.port = u.port;
    out.pathname = u.pathname;
    out.username = u.username ? "***" : "";
    out.password = u.password ? "***" : "";
  } catch (e) {
    out.ok = false;
    out.parseError = String(e?.message || e);
  }

  return out;
}

export async function GET() {
  return Response.json({
    env: {
      has_DATABASE_URL: !!process.env.DATABASE_URL,
      has_DIRECT_URL: !!process.env.DIRECT_URL,
      DATABASE_URL: safeParse(process.env.DATABASE_URL),
      DIRECT_URL: safeParse(process.env.DIRECT_URL),
    },
  });
}
