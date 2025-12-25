'use client';

import Link from 'next/link';
import { BellIcon } from '@heroicons/react/24/outline';
import HamburgerMenu from './Hamburger';

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      {/* ✅ make href absolute */}
      <Link href="/home" className="text-xl font-bold">STAQK 🚀</Link>

      <div className="flex items-center gap-4">
        <Link href="/notifications" className="relative hover:text-blue-400">
          <BellIcon className="h-6 w-6" />
        </Link>
        <HamburgerMenu />
      </div>
    </header>
  );
}
