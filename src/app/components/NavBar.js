'use client';
import Link from 'next/link';
import { FaHome, FaUserCircle, FaChartLine, } from 'react-icons/fa';


export default function Navbar() {
  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between">
      <span className="font-bold text-lg">Staqk</span>
      <div className="space-x-4">
        <Link href="/">Home</Link>
        <Link href="/account">Account</Link>
        <Link href="/market">Market</Link>
        <Link href="/me">Me</Link>
      </div>
    </nav>
  );
}