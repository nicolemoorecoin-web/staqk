import { addUser, prisma } from '../src/lib/admin_ops';

(async () => {
  const u = await addUser({
    email: 'user1@staqk.local',
    username: 'user1',
    name: 'User One',
    password: 'password123',
  });
  console.log('created user:', u.email, 'wallet:', u.wallet?.id);
  await prisma.$disconnect();
})();
