'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

import BottomNav from './BottomNav';

// Add more routes here if you want to hide chrome on other auth screens
const HIDE_ON = ['/'];

export default function AppChrome({ children }) {
  const pathname = usePathname();
  const hideChrome = HIDE_ON.includes(pathname);

  return (
    <>
      {!hideChrome && <Header />}

      {/* leave mobile-space for BottomNav on non-auth pages */}
      <main className={hideChrome ? '' : 'min-h-[100dvh] pb-16 md:pb-0'}>
        {children}
      </main>


      {!hideChrome && <BottomNav />}
    </>
  );
}
