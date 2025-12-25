import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

(async () => {
  const res = await prisma.tx.deleteMany({});
  console.log("Deleted", res.count, "transactions");
  process.exit(0);
})();
