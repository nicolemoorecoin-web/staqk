// src/app/components/SignOutButton.jsx
"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton({ className = "" }) {
  const handleSignOut = () => {
    // 🔁 IMPORTANT CHANGE:
    // Do NOT clear the "staqk_wallet" key anymore.
    // We want balances + investments to persist across logout/login
    // on this browser for the same user.

    // If you ever want to support multiple users on the same device
    // without leaking data, we can switch to a per-user key later,
    // e.g. "staqk_wallet_<userId>".

    signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      onClick={handleSignOut}
      className={
        "w-full py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold text-center transition " +
        className
      }
    >
      Sign out
    </button>
  );
}



