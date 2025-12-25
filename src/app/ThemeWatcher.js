// src/app/ThemeWatcher.jsx
"use client";

import { useEffect } from "react";


export default function ThemeWatcher() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem("pref.darkMode");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initialDark = saved === null ? prefersDark : saved === "true";

    document.documentElement.classList.toggle("dark", initialDark);
  }, []);

  return null;
}
