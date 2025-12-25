"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiSend, FiRefreshCw } from "react-icons/fi";
import { useRouter } from "next/navigation";

function AttachmentBlock({ attachments = [] }) {
  if (!attachments?.length) return null;

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((a) => {
        const isImg =
          a.kind === "IMAGE" || String(a.mime || "").startsWith("image/");

        if (isImg) {
          return (
            <a
              key={a.id || a.url}
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="block"
              title={a.name || "Open image"}
            >
              <img
                src={a.url}
                alt={a.name || "attachment"}
                className="rounded-xl max-h-72 w-auto border border-white/10"
              />
              {a.name ? (
                <div className="mt-1 text-[11px] text-white/70 truncate">
                  {a.name}
                </div>
              ) : null}
            </a>
          );
        }

        return (
          <a
            key={a.id || a.url}
            href={a.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
          >
            <div className="text-xs font-semibold truncate">
              {a.name || "Download file"}
            </div>
            <div className="text-[11px] text-white/70">
              {a.mime || "file"}
              {a.size ? ` • ${Math.round(Number(a.size) / 1024)} KB` : ""}
            </div>
          </a>
        );
      })}
    </div>
  );
}

function Bubble({ mine, text, sender, createdAt, attachments = [] }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[82%] rounded-2xl px-4 py-3 text-sm border border-white/5",
          mine ? "bg-emerald-600 text-white" : "bg-[#181d2b] text-gray-200",
        ].join(" ")}
      >
        {text ? <div className="whitespace-pre-wrap">{text}</div> : null}

        <AttachmentBlock attachments={attachments} />

        <div className="mt-2 text-[11px] opacity-70 flex gap-2">
          <span className="uppercase">{sender}</span>
          <span>•</span>
          <span>{createdAt ? new Date(createdAt).toLocaleString() : ""}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminChatClient({ me, threads = [] }) {
  const router = useRouter();

  const [selectedId, setSelectedId] = useState(threads[0]?.id || null);
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const listRef = useRef(null);
  const lastTs = useRef(null);

  const selectedThread = useMemo(
    () => threads.find((t) => t.id === selectedId) || null,
    [threads, selectedId]
  );

  function scrollToBottom() {
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    });
  }

  async function fetchMsgs(threadId) {
    if (!threadId) return;

    const after = lastTs.current;
    const url = after
      ? `/api/chat/messages?threadId=${encodeURIComponent(threadId)}&after=${encodeURIComponent(after)}`
      : `/api/chat/messages?threadId=${encodeURIComponent(threadId)}`;

    const r = await fetch(url, { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j?.ok) return;

    const newItems = j.items || [];
    if (!newItems.length) return;

    setItems((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const next = [...prev];
      for (const m of newItems) if (!seen.has(m.id)) next.push(m);
      return next;
    });

    lastTs.current = newItems[newItems.length - 1].createdAt;
    scrollToBottom();
  }

  useEffect(() => {
    if (!selectedId) return;

    setItems([]);
    lastTs.current = null;

    (async () => {
      await fetchMsgs(selectedId);
      scrollToBottom();
    })();

    const t = setInterval(() => fetchMsgs(selectedId), 2000);
    return () => clearInterval(t);
  }, [selectedId]);

  async function send() {
    if (!selectedId) return;
    const text = input.trim();
    if (!text) return;

    setLoading(true);
    try {
      const r = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: selectedId, text }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j?.ok) throw new Error(j?.error || "Send failed");

      setItems((prev) => [...prev, j.message]);
      lastTs.current = j.message.createdAt;
      setInput("");
      scrollToBottom();
      router.refresh();
    } catch (e) {
      alert(e?.message || "Could not send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[100dvh] bg-[#050816] text-white pb-16">
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#050816]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="font-bold text-lg">Admin Live Chat</div>
            <div className="text-xs text-gray-400">{me?.email}</div>
          </div>
          <button
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10"
          >
            <FiRefreshCw /> Refresh Threads
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
        <aside className="bg-[#0b1020] rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 font-semibold">
            Inbox ({threads.length})
          </div>

          <div className="max-h-[70dvh] overflow-y-auto">
            {threads.length === 0 ? (
              <div className="p-4 text-sm text-gray-400">No chat threads yet.</div>
            ) : (
              threads.map((t) => {
                const active = t.id === selectedId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={[
                      "w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5",
                      active ? "bg-white/5" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-sm truncate">
                        {t.user?.name || t.user?.username || t.user?.email}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200">
                        {t.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 truncate">{t.user?.email}</div>
                    <div className="mt-2 text-xs text-gray-300 truncate">
                      {t.last?.text || "(no messages yet)"}
                    </div>
                    <div className="mt-1 text-[11px] text-gray-500">
                      Updated: {new Date(t.updatedAt).toLocaleString()}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="bg-[#0b1020] rounded-2xl border border-white/10 overflow-hidden relative">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="font-semibold">
              {selectedThread ? `Chat with ${selectedThread.user?.email}` : "Select a thread"}
            </div>
            <div className="text-xs text-gray-400">
              {selectedThread ? `Thread: ${selectedThread.id}` : ""}
            </div>
          </div>

          <div
            ref={listRef}
            className="p-4 space-y-3 overflow-y-auto"
            style={{ height: "calc(70dvh - 60px)", paddingBottom: "110px" }}
          >
            {items.length === 0 ? (
              <div className="text-sm text-gray-400">No messages loaded yet.</div>
            ) : (
              items.map((m) => (
                <Bubble
                  key={m.id}
                  mine={m.sender === "SUPPORT"}
                  sender={m.sender}
                  text={m.text}
                  createdAt={m.createdAt}
                  attachments={m.attachments || []}
                />
              ))
            )}
          </div>

          <div className="absolute left-0 right-0 bottom-0 p-3 border-t border-white/10 bg-[#0b1020]">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedId ? "Type your reply..." : "Select a thread first"}
                disabled={!selectedId}
                className="flex-1 bg-[#050b19] border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <button
                onClick={send}
                disabled={!selectedId || !input.trim() || loading}
                className="bg-emerald-600 disabled:opacity-50 hover:bg-emerald-500 px-4 py-3 rounded-xl text-white font-semibold"
                type="button"
              >
                {loading ? "..." : <FiSend />}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
