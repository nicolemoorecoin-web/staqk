// src/lib/prisma.js
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const prismaClient =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prismaClient;
}

// ✅ support BOTH import styles:
// import prisma from "@/lib/prisma"
// import { prisma } from "@/lib/prisma"
export const prisma = prismaClient;
export default prismaClient;
