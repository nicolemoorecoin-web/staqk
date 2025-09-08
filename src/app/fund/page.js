// src/app/fund/page.js
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function FundBody() {
  // you were already doing this:
  const params = useSearchParams();
  const tab = params.get('tab') ?? 'deposit';

  // 👇 keep your existing JSX here (I’m showing a tiny stub)
  return (
    <main className="min-h-screen p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Fund</h1>
      <p className="text-gray-400">Active tab: {tab}</p>
      {/* ...the rest of YOUR page content... */}
    </main>
  );
}

export default function FundPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400">Loading…</div>}>
      <FundBody />
    </Suspense>
  );
}
