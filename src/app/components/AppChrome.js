'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

import BottomNav from './BottomNav';

// Add more routes here if you want to hide chrome on other auth screens
const HIDE_ON = ['/'];

export default function AppChrome({ children }) {
  const pathname = usePathname();

  // hide header/footer on auth pages
  const hideChrome =
    pathname === '/' || pathname.startsWith('/signup'); // add more like '/reset' if needed

  if (hideChrome) {
    // render page content only (no header/footer)
    return <>{children}</>;
  }

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
