import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.__prisma = prisma;

// ✅ Support BOTH styles:
// import prisma from "@/lib/prisma"
// import { prisma } from "@/lib/prisma"
export default prisma;
export { prisma };
