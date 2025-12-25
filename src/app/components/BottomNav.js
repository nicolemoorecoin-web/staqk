// src/app/components/BottomNav.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, WalletIcon, ChartBarIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useAppPrefs } from "./AppPrefsProvider";

const NAV_LABELS = {
  en: { home: "Home", account: "Account", market: "Market", me: "Me" },
  fr: { home: "Accueil", account: "Compte", market: "Marché", me: "Moi" },
  es: { home: "Inicio", account: "Cuenta", market: "Mercado", me: "Yo" },
  de: { home: "Start", account: "Konto", market: "Markt", me: "Ich" },
  ar: { home: "الرئيسية", account: "الحساب", market: "السوق", me: "أنا" },
  zh: { home: "主页", account: "账户", market: "市场", me: "我" },
};

export default function BottomNav() {
  const pathname = usePathname();
  const { language } = useAppPrefs();

  const L = NAV_LABELS[language] || NAV_LABELS.en;

  const items = [
    { href: "/home", label: L.home, Icon: HomeIcon },
    { href: "/account", label: L.account, Icon: WalletIcon },
    { href: "/market", label: L.market, Icon: ChartBarIcon },
    { href: "/me", label: L.me, Icon: UserCircleIcon },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur
                 text-white h-14 border-t border-gray-700 z-[100]
                 [padding-bottom:env(safe-area-inset-bottom)]"
    >
      <div className="flex justify-around items-center h-full">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center text-sm transition-colors ${
                active ? "text-blue-400" : "text-gray-300 hover:text-white"
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
