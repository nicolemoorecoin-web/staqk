// scripts/add-address.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const [asset, network, address, memo] = process.argv.slice(2);
  if (!asset || !network || !address) {
    console.log("Usage:\n  node scripts/add-address.js <ASSET> <NETWORK> <ADDRESS> [MEMO]");
    process.exit(1);
  }

  // requires @@unique([asset, network], name: "asset_network") in schema
  const row = await prisma.depositAddress.upsert({
    where: { asset_network: { asset, network } },
    update: { address, memo: memo ?? null, active: true },
    create: { asset, network, address, memo: memo ?? null, active: true },
  });

  console.log("Saved:", row);
}

main().finally(() => prisma.$disconnect());
