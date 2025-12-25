import { approveTx, prisma } from '../src/lib/admin_ops';

(async () => {
  const txId = process.argv[2];
  if (!txId) throw new Error('Usage: npm run approve -- <txId>');
  const tx = await approveTx(txId);
  console.log('approved:', tx.id, tx.status);
  await prisma.$disconnect();
})();
