'use client';
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
    <button onClick={handle} className={className || 'px-4 py-2 rounded-lg bg-red-600 text-white'}>
      Log out
    </button>
  );
}
