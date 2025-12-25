// app/(auth)/actions.ts
"use server";

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function registerUser(data: { name: string; email: string; password: string }) {
  const { name, email, password } = data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("Email already in use");

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: Role.USER,
      wallet: { create: {} }, // 1:1 wallet
    },
  });

  return { id: user.id, email: user.email, name: user.name };
}
