"use client";
import { FiDownload, FiUpload, FiArrowRight } from "react-icons/fi";

export default function QuickActions({ onDeposit, onWithdraw, onTransfer }) {
  const Tile = ({ icon, label, onClick, className = "" }) => (
    <button
      onClick={onClick}
      className={[
        "flex-1 min-w-[140px] h-14 rounded-2xl px-4",
        "bg-gradient-to-b from-[#1a2140] to-[#121a32]",
        "border border-blue-900/30 shadow-md",
        "text-white font-semibold flex items-center justify-center gap-2",
        "hover:from-[#212a50] hover:to-[#141d3a] active:opacity-90 transition",
        className,
      ].join(" ")}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <section className="px-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Tile icon={<FiDownload />} label="Deosit" onClick={onDeposit} />
        <Tile icon={<FiUpload />} label="Withdraw" onClick={onWithdraw} />
        <Tile icon={<FiArrowRight />} label="Transfer" onClick={onTransfer} />
      </div>
    </section>
  );
}
