"use client";
import { FiInfo } from "react-icons/fi";

const ANNOUNCEMENTS = [
  { title: "Scheduled Maintenance", date: "2025-08-20", body: "The platform will be down from 2 AM to 4 AM UTC for upgrades." },
  { title: "New Asset Added", date: "2025-08-15", body: "You can now trade Solana (SOL) on our platform." },
];

export default function Announcements() {
  return (
    <main className="bg-[#10141c] min-h-screen p-4">
      <h1 className="text-white text-xl font-bold mb-4">Announcements</h1>
      <div className="space-y-3">
        {ANNOUNCEMENTS.map((a, idx) => (
          <div key={idx} className="bg-[#181d2b] p-4 rounded-lg shadow">
            <div className="flex items-center gap-2 mb-1">
              <FiInfo className="text-blue-400" />
              <h2 className="text-white font-semibold">{a.title}</h2>
            </div>
            <p className="text-gray-500 text-xs mb-2">{a.date}</p>
            <p className="text-gray-300 text-sm">{a.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
