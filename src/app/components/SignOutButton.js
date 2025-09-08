'use client';
import { useRouter } from 'next/navigation';

export default function SignOutButton({ className = '', children = 'Sign out' }) {
  const router = useRouter();

  function handleSignOut() {
    document.cookie = 'staqk_auth=; Max-Age=0; path=/;';  // remove cookie
    try {
      localStorage.removeItem('staqk_wallet');
      localStorage.removeItem('staqk_auth');
      localStorage.removeItem('staqk_user');
    } catch {}
    router.push('/');
  }

  return (
    <button type="button" onClick={handleSignOut} className={className || 'w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg'}>
      {children}
    </button>
  );
}
