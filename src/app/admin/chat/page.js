// src/app/admin/chat/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { redirect } from "next/navigation";
import prisma from "../../../lib/prisma";
import AdminChatClient from "./AdminChatClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminChatPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login?next=/admin/chat");

  // Enforce admin role from DB
  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!me || me.role !== "ADMIN") redirect("/home");

  const threads = await prisma.chatThread.findMany({
    orderBy: [{ updatedAt: "desc" }],
    take: 80,
    include: {
      user: { select: { id: true, email: true, name: true, username: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, sender: true, text: true, createdAt: true },
      },
    },
  });

  const safeThreads = threads.map((t) => ({
    id: t.id,
    status: t.status,
    updatedAt: t.updatedAt.toISOString(),
    createdAt: t.createdAt.toISOString(),
    user: {
      id: t.user.id,
      email: t.user.email,
      name: t.user.name,
      username: t.user.username,
    },
    last: t.messages?.[0]
      ? {
          sender: t.messages[0].sender,
          text: t.messages[0].text,
          createdAt: t.messages[0].createdAt.toISOString(),
        }
      : null,
  }));

  return <AdminChatClient me={me} threads={safeThreads} />;
}
