import Link from "next/link";
import { BellIcon, Bars3Icon } from "@heroicons/react/24/outline";

export default function TopNav() {
  return (
    <header className="fixed top-0 left-0 w-full bg-neutral-900 text-white flex items-center justify-between px-4 h-14 z-50 border-b border-neutral-800">
      <span className="text-xl font-bold tracking-wide">Staqk</span>
      <div className="flex items-center gap-4">
        <Link href="/notifications" className="hover:text-blue-400">
          <BellIcon className="h-6 w-6" />
        </Link>
        <button className="hover:text-blue-400">
          <Bars3Icon className="h-7 w-7" />
        </button>
      </div>
    </header>
  );
}
