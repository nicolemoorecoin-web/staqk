'use client';
import { signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';

export function SignOutButton({ className = '' }) {
  const router = useRouter();

  async function handle() {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' }); // clear cookie
    } catch {}
    localStorage.removeItem('staqk_auth');                    // clear local echo
    router.push('/');                                        // back to login
  }

 
    return (
    <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg px-3 py-2 bg-slate-800 text-slate-100 hover:bg-slate-700">
      Sign out 
    </button>
  );
}
