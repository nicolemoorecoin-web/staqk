// src/app/components/BottomNavGate.jsx
"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import BottomNav from "./BottomNav";

export default function BottomNavGate() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") return null;
  if (!session) return null;

  if (pathname === "/login" || pathname === "/signup") return null;

  return <BottomNav />;
}
