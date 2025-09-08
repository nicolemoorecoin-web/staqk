'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, WalletIcon, ChartBarIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: '/home',   label: 'Home',   Icon: HomeIcon },
    { href: '/account',label: 'Account',Icon: WalletIcon },
    { href: '/market', label: 'Market', Icon: ChartBarIcon },
    { href: '/me',     label: 'Me',     Icon: UserCircleIcon },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur
                 text-white h-14 border-t border-gray-700 z-[100]
                 [padding-bottom:env(safe-area-inset-bottom)]"
    >
      <div className="flex justify-around items-center h-full">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center text-sm transition-colors ${
                active ? 'text-blue-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
