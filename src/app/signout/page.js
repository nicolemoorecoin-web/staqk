"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear session data here
    setTimeout(() => {
      router.replace("/"); // Redirect home or login
    }, 1000);
  }, [router]);

  return (
    <main className="bg-[#10141c] min-h-screen p-4 flex items-center justify-center">
      <p className="text-gray-400">Signing you out...</p>
    </main>
  );
}