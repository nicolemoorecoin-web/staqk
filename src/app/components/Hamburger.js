'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/account', label: 'Accounts' },
    { href: '/fund', label: 'Fund / Withdraw' },
    { href: '/reports', label: 'Reports' },
    { href: '/strategies', label: 'Strategies' },
    { href: '/market', label: 'Market' },
    { href: '/me', label: 'Profile' },
    { href: '/support', label: 'Support' },
    { href: '/legal', label: 'Legal' },
    { href: '/signout', label: 'Sign Out' },
  ];

  return (
    <>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {/* Hamburger icon */}
        <span className="text-xl">☰</span>
      </div>

      {open && (
        <div className="fixed top-0 right-0 bg-gray-900 text-white w-64 h-full p-6 z-50 shadow-lg overflow-y-auto">
          {/* Close button */}
          <div className="flex justify-end mb-6">
            <button onClick={() => setOpen(false)} className="text-red-400 hover:text-red-600 text-lg">
              ❌ Close
            </button>
          </div>

<nav className="flex flex-col gap-4">
  {links.map(({ href, label }) => (
    <Link
      key={href}
      href={href}
      onClick={() => setOpen(false)}
      className={`px-4 py-2 rounded transition-all duration-200 
        hover:bg-gray-700 
        hover:text-blue-400 
        hover:pl-8 
        hover:scale-105 
        hover:shadow-md 
        hover:border-l-4 
        hover:border-blue-400
        ${pathname === href ? 'bg-gray-700 font-bold text-blue-300 border-l-4 border-blue-400' : ''}
      `}
    >
      {label}
    </Link>
  ))}
</nav>

        </div>
      )}
    </>
  );
}