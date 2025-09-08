"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
// replace your imports with these
import {
  FiArrowLeft,
  FiBell,
  FiTrendingUp,
  FiCheckCircle,
  FiInfo,
  FiMail,
  FiTrash2,
} from "react-icons/fi";
import { TbMailOpened } from "react-icons/tb"; // <-- read state icon
import { useWalletStore } from "src/lib/walletStore";

/**
 * Notification shape (demo):
 * { id, type: 'price'|'tx'|'system', title, body, ts, read?: boolean, meta?: any }
 */

const DEMO = [
  {
    id: "n1",
    type: "price",
    title: "Ethereum (ETH) price is approaching $4,300",
    body: "24h change +5.3%. Your alert threshold: $4,250.",
    ts: Date.now() - 1000 * 60 * 15,
    read: false,
    meta: { symbol: "ETH", price: 4290 },
  },
  {
    id: "n2",
    type: "tx",
    title: "USDT Deposit successful",
    body: "Amount: $350.00 · TRC20 · 19:54:05",
    ts: Date.now() - 1000 * 60 * 60,
    read: false,
  },
  {
    id: "n3",
    type: "system",
    title: "Security tip: Enable 2FA",
    body: "Protect your account with authenticator app or SMS.",
    ts: Date.now() - 1000 * 60 * 90,
    read: true,
  },
  {
    id: "n4",
    type: "tx",
    title: "Card purchase pending",
    body: "Merchant: Aurora Coffee · -$8.20",
    ts: Date.now() - 1000 * 60 * 60 * 7,
    read: true,
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState(DEMO);
  const [filter, setFilter] = useState("all"); // all | price | tx | system
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((n) => n.type === filter);
  }, [items, filter]);

  const unreadCount = items.filter((n) => !n.read).length;

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }
  function clearAll() {
    setItems([]);
  }
  function toggleRead(id) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  }
  function removeOne(id) {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <main className="min-h-[100dvh] bg-[#10141c]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#10141c]/95 backdrop-blur border-b border-gray-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-gray-300 hover:text-white"
              aria-label="Back"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-white text-lg font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="text-xs font-semibold text-blue-300 hover:text-blue-200"
            >
              Mark all read
            </button>
            <button
              onClick={clearAll}
              className="text-xs font-semibold text-red-300 hover:text-red-200"
              title="Clear all"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-2 pb-2">
          <div className="flex gap-2 bg-[#161b29] rounded-xl p-1 mx-2">
            {[
              { k: "all", label: "All", icon: <FiBell /> },
              { k: "price", label: "Price Alerts", icon: <FiTrendingUp /> },
              { k: "tx", label: "Transactions", icon: <FiCheckCircle /> },
              { k: "system", label: "System", icon: <FiInfo /> },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setFilter(t.k)}
                className={`flex-1 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2
                  ${filter === t.k ? "bg-blue-600 text-white" : "text-gray-300"}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-2xl mx-auto p-3 sm:p-4">
        {loading ? (
          <Skeleton />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-3">
            {filtered.map((n) => (
              <li
                key={n.id}
                className="bg-[#0f1424] border border-blue-900/30 rounded-xl px-3 py-3 sm:px-4 sm:py-4"
              >
                <div className="flex items-start gap-3">
                  <IconBadge type={n.type} read={n.read} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold truncate">
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mt-0.5">
                      {n.body}
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      {timeAgo(n.ts)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => toggleRead(n.id)}
                      className="text-gray-300 hover:text-white"
                      title={n.read ? "Mark as unread" : "Mark as read"}
                    >
                      {n.read ? (
                        <TbMailOpened className="h-5 w-5" />
                      ) : (
                        <FiMail className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => removeOne(n.id)}
                      className="text-gray-300 hover:text-red-300"
                      title="Delete"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

/* --- Small pieces --- */

function IconBadge({ type, read }) {
  const base =
    "w-10 h-10 rounded-full flex items-center justify-center shrink-0";
  if (type === "price")
    return (
      <div className={`${base} ${read ? "bg-blue-500/10" : "bg-blue-500/20"} text-blue-300`}>
        <FiTrendingUp />
      </div>
    );
  if (type === "tx")
    return (
      <div className={`${base} ${read ? "bg-green-500/10" : "bg-green-500/20"} text-green-300`}>
        <FiCheckCircle />
      </div>
    );
  return (
    <div className={`${base} ${read ? "bg-yellow-500/10" : "bg-yellow-500/20"} text-yellow-300`}>
      <FiInfo />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-[#0f1424] border border-blue-900/30 rounded-xl p-8 text-center text-gray-400">
      <FiBell className="mx-auto mb-3 h-8 w-8 text-gray-500" />
      No notifications yet
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-[#0f1424] border border-blue-900/30 rounded-xl px-4 py-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-white/5 rounded" />
              <div className="h-3 w-1/2 bg-white/5 rounded" />
              <div className="h-3 w-1/3 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function timeAgo(ts) {
  const d = new Date(ts || Date.now());
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return d.toLocaleString();
}
