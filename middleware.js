"use client";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import BottomNav from "./BottomNav"; // adjust import

export default function BottomNavGate() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // hide during loading (optional)
  if (status === "loading") return null;

  // hide if not logged in
  if (!session) return null;

  // hide on auth pages
  if (pathname === "/login" || pathname === "/signup") return null;

  return <BottomNav />;
}
