"use client";
import { useState } from "react";
import { FiSearch } from "react-icons/fi";

const FAQ = [
  { q: "How do I deposit funds?", a: "Go to Account → Deposit, choose asset, follow instructions." },
  { q: "How to reset my password?", a: "Settings → Security → Reset Password." },
  { q: "How do I enable 2FA?", a: "Settings → Security → Enable Two-Factor Authentication." },
];

export default function HelpCenter() {
  const [query, setQuery] = useState("");

  const filtered = FAQ.filter(item =>
    item.q.toLowerCase().includes(query.toLowerCase()) ||
    item.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="bg-[#10141c] min-h-screen p-4">
      <h1 className="text-white text-xl font-bold mb-4">Help Center</h1>
      <div className="flex items-center bg-[#181d2b] rounded-lg px-3 py-2 mb-4">
        <FiSearch className="text-gray-400 mr-2" />
        <input
          className="bg-transparent outline-none text-white w-full"
          placeholder="Search help articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.map((item, idx) => (
          <div key={idx} className="bg-[#181d2b] p-4 rounded-lg shadow">
            <h2 className="text-white font-semibold">{item.q}</h2>
            <p className="text-gray-400 text-sm mt-1">{item.a}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-500 text-sm">No results found.</p>
        )}
      </div>
    </main>
  );
}
