import { prisma, createDeposit } from '../src/lib/admin_ops';

async function run() {
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@staqk.local' },
    include: { wallet: true },
  });
  if (!admin) throw new Error('admin not found');
  console.log('admin:', admin.email, 'wallet:', admin.wallet?.id);

  const tx = await createDeposit(admin.id, 100, 'USD');
  console.log('created deposit tx:', tx.id);

  await prisma.$disconnect();
}
run().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
