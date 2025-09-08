'use client';

import Link from 'next/link';
import { BellIcon } from '@heroicons/react/24/outline';
import HamburgerMenu from './Hamburger';

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <Link href="/" className="text-xl font-bold">STAQK 🚀</Link>

      <div className="flex items-center gap-4">
        <Link href="/notifications" className="relative hover:text-blue-400">
          <BellIcon className="h-6 w-6" />
          {/* optional red dot */}
          {/* <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" /> */}
        </Link>
        <HamburgerMenu />
      </div>
    </header>
  );
}
