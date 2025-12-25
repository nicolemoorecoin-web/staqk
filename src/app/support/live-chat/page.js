// src/app/support/live-chat/page.js
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiSend, FiPaperclip, FiX } from "react-icons/fi";

const NAV_H = 56; // BottomNav height (h-14)

function Bubble({ mine, text, attachments = [] }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[82%] rounded-2xl px-4 py-3 text-sm",
          mine
            ? "bg-blue-600 text-white"
            : "bg-[#181d2b] text-gray-200 border border-white/5",
        ].join(" ")}
      >
        {text ? <div className="whitespace-pre-wrap">{text}</div> : null}

        {attachments?.length ? (
          <div className="mt-2 space-y-2">
            {attachments.map((a) => {
              const isImg = a.kind === "IMAGE" || (a.mime || "").startsWith("image/");
              if (isImg) {
                return (
                  <a key={a.id || a.url} href={a.url} target="_blank" rel="noreferrer">
                    <img
                      src={a.url}
                      alt={a.name || "attachment"}
                      className="rounded-xl max-h-64 w-auto border border-white/10"
                    />
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
                  <div className="text-xs font-semibold truncate">{a.name || "Download file"}</div>
                  <div className="text-[11px] text-white/70">
                    {(a.mime || "file")} {a.size ? `• ${Math.round(a.size / 1024)} KB` : ""}
                  </div>
                </a>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function LiveChat() {
  const [threadId, setThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [booting, setBooting] = useState(true);
  const [status, setStatus] = useState("Connecting...");

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const listRef = useRef(null);
  const lastTs = useRef(null);

  const composerRef = useRef(null);
  const [composerH, setComposerH] = useState(96);

  const canSend = useMemo(() => {
    return (!!input.trim() || !!file) && !sending && !!threadId;
  }, [input, file, sending, threadId]);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    });
  }

  useEffect(() => {
    if (!composerRef.current) return;
    const ro = new ResizeObserver(() => {
      const h = composerRef.current?.getBoundingClientRect?.().height || 96;
      setComposerH(h);
    });
    ro.observe(composerRef.current);
    return () => ro.disconnect();
  }, []);

  async function bootThread() {
    setBooting(true);
    setStatus("Connecting...");
    try {
      const r = await fetch("/api/chat/thread", { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j?.ok) throw new Error(j?.error || "Could not start chat");
      setThreadId(j.thread.id);
      setStatus("Connected");
    } catch (e) {
      console.error(e);
      setStatus(e?.message || "Not connected");
    } finally {
      setBooting(false);
    }
  }

  async function fetchNewMessages(tid) {
    if (!tid) return;

    const after = lastTs.current;
    const url = after
      ? `/api/chat/messages?threadId=${encodeURIComponent(tid)}&after=${encodeURIComponent(after)}`
      : `/api/chat/messages?threadId=${encodeURIComponent(tid)}`;

    const r = await fetch(url, { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j?.ok) return;

    const items = j.items || [];
    if (items.length) {
      setMessages((prev) => {
        const seen = new Set(prev.map((x) => x.id));
        const next = [...prev];
        for (const it of items) {
          if (!seen.has(it.id)) next.push(it);
        }
        return next;
      });
      lastTs.current = items[items.length - 1].createdAt;
      scrollToBottom();
    }
  }

  useEffect(() => {
    bootThread();
  }, []);

  useEffect(() => {
    if (!threadId) return;

    (async () => {
      setMessages([]);
      lastTs.current = null;
      await fetchNewMessages(threadId);
      scrollToBottom();
    })();

    const t = setInterval(() => fetchNewMessages(threadId), 2000);
    return () => clearInterval(t);
  }, [threadId]);

  async function uploadSelectedFile(f) {
    const form = new FormData();
    form.append("file", f);

    const r = await fetch("/api/upload", { method: "POST", body: form });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j?.url) throw new Error(j?.error || "Upload failed");

    const mime = j.mime || f.type || "";
    const kind = mime.startsWith("image/") ? "IMAGE" : "FILE";

    return {
      url: j.url,
      name: j.name || f.name,
      mime,
      size: j.size || f.size,
      kind,
    };
  }

  async function sendMessage() {
    if (!canSend) return;

    setSending(true);
    try {
      let attachments = [];
      if (file) attachments = [await uploadSelectedFile(file)];

      const r = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          text: input.trim(),
          attachments,
        }),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j?.ok) throw new Error(j?.error || "Send failed");

      setMessages((prev) => [...prev, j.message]);
      lastTs.current = j.message.createdAt;

      setInput("");
      setFile(null);
      scrollToBottom();
    } catch (e) {
      console.error(e);
      alert(e?.message || "Could not send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="bg-[#10141c] min-h-[100dvh]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#10141c]/90 backdrop-blur border-b border-white/5">
        <div className="max-w-xl mx-auto px-4 py-4">
          <div className="text-white font-bold">Live Chat Support</div>
          <div className="text-xs text-gray-400">{booting ? "Connecting..." : status}</div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        className="max-w-xl mx-auto px-4 pt-4 space-y-3 overflow-y-auto"
        style={{
          height: "calc(100dvh - 72px)",
          paddingBottom: `${composerH + NAV_H + 18}px`,
        }}
      >
        {messages.map((m) => (
          <Bubble
            key={m.id}
            mine={m.sender === "USER"}
            text={m.text}
            attachments={m.attachments || []}
          />
        ))}
      </div>

      {/* Composer */}
      <div
        ref={composerRef}
        className="fixed left-0 right-0 z-[90]"
        style={{ bottom: `calc(${NAV_H}px + env(safe-area-inset-bottom))` }}
      >
        <div className="max-w-xl mx-auto px-3">
          <div className="rounded-2xl border border-white/10 bg-[#0f1424]/95 backdrop-blur shadow-xl p-2">
            {file ? (
              <div className="px-2 py-2 flex items-center justify-between gap-2 text-xs text-gray-200">
                <div className="truncate">
                  Attached: <span className="text-white font-semibold">{file.name}</span>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10"
                  type="button"
                >
                  <FiX />
                </button>
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white"
                type="button"
                aria-label="Attach file"
              >
                <FiPaperclip />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);
                  e.target.value = "";
                }}
              />

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-white px-2 py-3 outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />

              <button
                onClick={sendMessage}
                disabled={!canSend}
                className="bg-blue-600 disabled:opacity-50 hover:bg-blue-500 px-4 py-3 rounded-xl text-white font-semibold"
                type="button"
              >
                {sending ? "..." : <FiSend />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
