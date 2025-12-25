import { prisma, createDeposit } from '../src/lib/admin_ops';

(async () => {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@staqk.local' } });
  if (!admin) throw new Error('admin not found');
  const tx = await createDeposit(admin.id, 50, 'USD');
  console.log('created deposit tx:', tx.id, tx.status);
  await prisma.$disconnect();
})();
