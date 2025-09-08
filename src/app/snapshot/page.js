// app/snapshot/page.js  (or src/app/snapshot/page.js if you use /src)
import SnapshotClient from './SnapshotClient';

export const metadata = {
  title: 'Weekly Snapshot | Staqk',
  description: 'Dynamic Hedged Arbitrage Rotation — weekly performance summary',
};

export default function Page() {
  return <SnapshotClient />;
}
