"use client";

import Link from "next/link";
import { FiDownload, FiUpload, FiArrowRight } from "react-icons/fi";
import { useAppPrefs } from "./AppPrefsProvider";

export default function QuickActions() {
  const { t } = useAppPrefs();

  const btn =
    "rounded-xl bg-[#172037] text-white py-4 font-semibold hover:bg-[#1e2a4a] flex items-center justify-center gap-2";

  return (
    <div className="grid grid-cols-3 gap-4 px-4">
      <Link href="/account/deposit" className={btn}>
        <FiDownload /> <span>{t("deposit")}</span>
      </Link>

      <Link href="/account/withdraw" className={btn}>
        <FiUpload /> <span>{t("withdraw")}</span>
      </Link>

      <Link href="/account/transfer" className={btn}>
        <FiArrowRight /> <span>{t("transfer")}</span>
      </Link>
    </div>
  );
}
