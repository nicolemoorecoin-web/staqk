// central place to manage tab order, paths, labels, icons
import { AiOutlineHome } from "react-icons/ai";
import { MdAccountBalanceWallet, MdShowChart } from "react-icons/md";
import { HiOutlineUserCircle } from "react-icons/hi";

export const TABS = [
  { key: "home",   label: "Home",   href: "/home",   icon: AiOutlineHome },
  { key: "account",label: "Account",href: "/account",icon: MdAccountBalanceWallet },
  { key: "market", label: "Market", href: "/market", icon: MdShowChart },
  { key: "me",     label: "Me",     href: "/profile",icon: HiOutlineUserCircle },
];

// routes where the bottom bar should be hidden (auth, full‑screen flows, etc.)
export const HIDE_TABS_ON = ["/signin", "/signup", "/trade"];
