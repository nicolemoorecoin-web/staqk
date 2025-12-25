import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { redirect } from "next/navigation";
import prisma from "../../../lib/prisma";
import SupportAdminClient from "./SupportAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSupportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login?next=/admin/support");

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, role: true, name: true },
  });

  if (!me || me.role !== "ADMIN") redirect("/home");

  return <SupportAdminClient me={me} />;
}
