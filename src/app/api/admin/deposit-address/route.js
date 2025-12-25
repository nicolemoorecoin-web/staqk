import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizeAsset(v) {
  return String(v || "").trim().toUpperCase();
}

function normalizeNetwork(v) {
  const raw = String(v || "").trim();

  // If user types "TRON (TRC20)" etc, extract the standard key
  const upper = raw.toUpperCase();

  if (upper.includes("TRC20")) return "TRC20";
  if (upper.includes("ERC20")) return "ERC20";
  if (upper.includes("BEP20")) return "BEP20";
  if (upper.includes("BITCOIN")) return "BITCOIN";
  if (upper.includes("SOLANA")) return "SOLANA";
  if (upper.includes("ETHEREUM")) return "ETHEREUM";
  if (upper.includes("TRON")) return "TRC20"; // common admin input

  return upper.replace(/\s+/g, " ").trim();
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!me || me.role !== "ADMIN") return null;
  return me;
}

export async function POST(req) {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { asset, network, address, memo = "", active = true } = body || {};
  if (!asset || !network || !address) {
    return NextResponse.json(
      { ok: false, error: "asset, network, address required" },
      { status: 400 }
    );
  }

  const assetKey = normalizeAsset(asset);
  const networkKey = normalizeNetwork(network);
  const addr = String(address).trim();

  const row = await prisma.adminAddress.upsert({
    where: {
      asset_network: {
        asset: assetKey,
        network: networkKey,
      },
    },
    update: {
      address: addr,
      memo: String(memo || "").trim(),
      active: Boolean(active),
    },
    create: {
      asset: assetKey,
      network: networkKey,
      address: addr,
      memo: String(memo || "").trim(),
      active: Boolean(active),
    },
  });

  return NextResponse.json({ ok: true, id: row.id });
}

export async function DELETE(req) {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { id } = body || {};
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  await prisma.adminAddress.delete({ where: { id: String(id) } });

  return NextResponse.json({ ok: true });
}
