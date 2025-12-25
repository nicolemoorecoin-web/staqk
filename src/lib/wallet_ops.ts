// src/lib/wallet_ops.ts
import { PrismaClient, Prisma, TxType, TxStatus } from '@prisma/client';

export const prisma = new PrismaClient();

/** Ensure a user has a wallet and return it */
export async function getOrCreateWallet(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });

  if (user?.wallet) return user.wallet;

  // create wallet linked to user (FK lives on Wallet.userId)
  const wallet = await prisma.wallet.create({
    data: { user: { connect: { id: userId } } },
  });

  return wallet;
}

/** Example: post a deposit and create a Tx */
export async function postDeposit(userId: string, amount: number, title = 'Deposit') {
  const wallet = await getOrCreateWallet(userId);
  const dec = new Prisma.Decimal(amount);

  const updated = await prisma.wallet.update({
    where: { id: wallet.id },
    data: {
      cash: { increment: dec },
      income: { increment: dec },
      total: { increment: dec },
      tx: {
        create: {
          title,
          type: TxType.DEPOSIT,
          amount: dec,
          status: TxStatus.SUCCESS,
          currency: 'USD',
        },
      },
    },
    include: { tx: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });
  return updated;
}
