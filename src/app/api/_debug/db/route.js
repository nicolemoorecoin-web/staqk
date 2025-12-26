// src/app/api/_debug/db/route.js
export const runtime = "nodejs"; // Prisma runs on Node runtime
export const dynamic = "force-dynamic";

function maskUrl(raw) {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    // hide creds
    u.username = u.username ? "***" : "";
    u.password = u.password ? "***" : "";
    return u.toString();
  } catch {
    // If URL() can't parse it, just return a masked snippet
    const s = String(raw);
    return s.length > 12 ? s.slice(0, 6) + "***" + s.slice(-6) : "***";
  }
}

function inspectEnv(name) {
  const raw = process.env[name];

  const info = {
    present: !!raw,
    length: raw ? raw.length : 0,
    startsWithQuote: raw ? raw.startsWith('"') || raw.startsWith("'") : false,
    endsWithQuote: raw ? raw.endsWith('"') || raw.endsWith("'") : false,
    hasLeadingWhitespace: raw ? /^\s/.test(raw) : false,
    hasTrailingWhitespace: raw ? /\s$/.test(raw) : false,
    hasNewline: raw ? /[\r\n]/.test(raw) : false,
    hasSpace: raw ? / /.test(raw) : false,
    masked: maskUrl(raw),
    parsed: null,
    parseError: null,
  };

  if (!raw) return info;

  try {
    const u = new URL(raw);

    info.parsed = {
      protocol: u.protocol, // should be "postgresql:" or "postgres:"
      host: u.hostname,
      port: u.port || "(none)",
      pathname: u.pathname, // should include "/postgres" typically
      search: u.search,     // shows "?pgbouncer=true&sslmode=require" etc
      // Helpful sanity checks:
      usernamePresent: !!u.username,
      passwordPresent: !!u.password,
    };
  } catch (e) {
    info.parseError = String(e?.message || e);
  }

  return info;
}

export async function GET() {
  const result = {
    now: new Date().toISOString(),
    env: {
      DATABASE_URL: inspectEnv("DATABASE_URL"),
      DIRECT_URL: inspectEnv("DIRECT_URL"),
    },
    notes: [
      "If port is missing or parseError mentions 'invalid port', the env string likely has quotes, spaces, or hidden newlines.",
      "If protocol is not 'postgresql:' or 'postgres:', the URL is wrong.",
      "If host/port look correct but DB still fails, it may be IPv4/IPv6 connectivity or Supabase pooler settings.",
    ],
  };

  return Response.json(result, { status: 200 });
}
