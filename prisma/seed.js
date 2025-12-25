const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Admin user (existing)
  await prisma.user.upsert({
    where: { email: 'admin@staqk.local' },
    update: {},
    create: {
      email: 'admin@staqk.local',
      username: 'admin',
      name: 'Admin',
      role: 'ADMIN',
      passwordHash: '$2b$10$JVIWaQnGlzeRDdX15EXdYu2oTE2vN4CPcJU/wmRegpzwKisq6k7IK', // "admin123"
      wallet: {
        create: { cash: 0, crypto: 0, staking: 0, earn: 0, investments: 0, income: 0, expense: 0, total: 0 }
      }
    }
  });
  console.log('Admin ready: admin@staqk.local (password: admin123)');

  // AdminAddress upserts (idempotent)
  await prisma.adminAddress.upsert({
    where: { asset_network: { asset: 'BTC', network: 'Bitcoin' } },
    update: {},
    create: { asset: 'BTC', network: 'Bitcoin', address: 'bc1qexamplebtc...' },
  });

  await prisma.adminAddress.upsert({
    where: { asset_network: { asset: 'USDT', network: 'TRC20' } },
    update: {},
    create: { asset: 'USDT', network: 'TRC20', address: 'TExampleUsdtTrc20...' },
  });

  await prisma.adminAddress.upsert({
    where: { asset_network: { asset: 'ETH', network: 'ERC20' } },
    update: {},
    create: { asset: 'ETH', network: 'ERC20', address: '0xexampleeth...' },
  });

  console.log('Admin addresses seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());