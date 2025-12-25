// src/app/api/deposit-address/route.js
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizeAsset(v) {
  return String(v || "").trim().toUpperCase();
}

/**
 * Must match what AdminAddress.network is stored as.
 * Standard keys we will use:
 * - BTC: BITCOIN
 * - SOL: SOLANA
 * - ETH: ETHEREUM
 * - Tokens: TRC20 / ERC20 / BEP20
 */
function normalizeNetwork(v) {
  const raw = String(v || "").trim();
  const up = raw.toUpperCase();

  // direct standard codes
  if (up === "TRC20") return "TRC20";
  if (up === "ERC20") return "ERC20";
  if (up === "BEP20") return "BEP20";

  // common synonyms from UI / admins
  if (up === "BTC" || up.includes("BITCOIN")) return "BITCOIN";
  if (up === "SOL" || up.includes("SOLANA")) return "SOLANA";
  if (up === "ETH" || up.includes("ETHEREUM")) return "ETHEREUM";

  // labels like "Tron (TRC20)" etc
  if (up.includes("TRC20")) return "TRC20";
  if (up.includes("ERC20")) return "ERC20";
  if (up.includes("BEP20")) return "BEP20";

  return up;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const asset = searchParams.get("asset");
    const network = searchParams.get("network");

    if (!asset || !network) {
      return NextResponse.json(
        { ok: false, error: "asset and network are required" },
        { status: 400 }
      );
    }

    const assetKey = normalizeAsset(asset);
    const networkKey = normalizeNetwork(network);

    const row = await prisma.adminAddress.findUnique({
      where: { asset_network: { asset: assetKey, network: networkKey } },
    });

    // Only return if active
    if (!row || !row.active) {
      return NextResponse.json({
        ok: true,
        found: false,
        asset: assetKey,
        network: networkKey,
      });
    }

    return NextResponse.json({
      ok: true,
      found: true,
      asset: assetKey,
      network: networkKey,
      address: {
        id: row.id,
        asset: row.asset,
        network: row.network,
        address: row.address,
        memo: row.memo || "",
        active: row.active,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
