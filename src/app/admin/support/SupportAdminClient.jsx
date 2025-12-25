"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiSend, FiPaperclip } from "react-icons/fi";

function isImageMime(mime) {
  return typeof mime === "string" && mime.startsWith("image/");
}

export default function SupportAdminClient({ me }) {
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  const lastTs = useMemo(() => {
    const last = messages[messages.length - 1];
    return last?.createdAt || null;
  }, [messages]);

  async function loadThreads() {
    try {
      const r = await fetch("/api/admin/chat/threads", { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j?.ok && Array.isArray(j.items)) {
        setThreads(j.items);
        if (!activeId && j.items[0]?.id) setActiveId(j.items[0].id);
      }
    } catch {}
  }

  useEffect(() => {
    loadThreads();
    const t = setInterval(loadThreads, 4000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load active thread messages + poll new ones
  useEffect(() => {
    if (!activeId) return;
    let alive = true;
    let timer = null;

    async function initial() {
      try {
        const r = await fetch(`/api/chat/messages?threadId=${encodeURIComponent(activeId)}`, { cache: "no-store" });
        const j = await r.json().catch(() => ({}));
        if (!alive) return;
        if (r.ok && j?.ok && Array.isArray(j.items)) setMessages(j.items);
      } catch {}
    }

    async function poll() {
      try {
        const qs = lastTs ? `&after=${encodeURIComponent(lastTs)}` : "";
        const r = await fetch(`/api/chat/messages?threadId=${encodeURIComponent(activeId)}${qs}`, { cache: "no-store" });
        const j = await r.json().catch(() => ({}));
        if (!alive) return;
        if (r.ok && j?.ok && Array.isArray(j.items) && j.items.length) {
          setMessages((prev) => [...prev, ...j.items]);
        }
      } catch {}
    }

    initial();
    timer = setInterval(poll, 2000);

    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
  }, [activeId, lastTs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function uploadFiles(files) {
    setErr("");
    const list = Array.from(files || []);
    if (!list.length) return;

    setUploading(true);
    try {
      const uploaded = [];
      for (const f of list.slice(0, 5)) {
        const fd = new FormData();
        fd.append("file", f);

        const r = await fetch("/api/upload", { method: "POST", body: fd });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j?.url) throw new Error(j?.error || "Upload failed");

        uploaded.push({
          url: j.url,
          name: j.name || f.name,
          mime: j.mime || f.type,
          size: j.size || f.size,
          kind: isImageMime(j.mime || f.type) ? "IMAGE" : "FILE",
        });
      }
      setPendingFiles((prev) => [...prev, ...uploaded].slice(0, 8));
    } catch (e) {
      setErr(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function send() {
    setErr("");
    if (!activeId) return;

    const text = input.trim();
    if (!text && pendingFiles.length === 0) return;

    setBusy(true);
    try {
      // optimistic
      const optimistic = {
        id: `tmp_${Date.now()}`,
        threadId: activeId,
        sender: "SUPPORT",
        text: text || null,
        createdAt: new Date().toISOString(),
        attachments: pendingFiles,
      };
      setMessages((p) => [...p, optimistic]);

      setInput("");
      setPendingFiles([]);

      const r = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: activeId, text, attachments: pendingFiles }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j?.ok) throw new Error(j?.error || "Send failed");
    } catch (e) {
      setErr(e?.message || "Could not send");
    } finally {
      setBusy(false);
    }
  }

  const activeThread = threads.find((t) => t.id === activeId);

  return (
    <main className="min-h-[100dvh] bg-[#050816] text-white pb-16">
      <div className="sticky top-0 z-20 px-4 py-3 border-b border-white/10 bg-[#050816]/95 backdrop-blur flex items-center justify-between">
        <div className="font-bold">Support Inbox</div>
        <div className="text-xs text-gray-400">{me?.email}</div>
      </div>

      <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
        {/* Thread list */}
        <aside className="bg-[#0b1020] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 text-sm font-semibold text-gray-200">
            Conversations
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {threads.length === 0 ? (
              <div className="p-4 text-sm text-gray-400">No chats yet.</div>
            ) : (
              threads.map((t) => {
                const last = t.messages?.[0];
                const active = t.id === activeId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveId(t.id)}
                    className={[
                      "w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5",
                      active ? "bg-white/5" : "",
                    ].join(" ")}
                    type="button"
                  >
                    <div className="text-sm font-semibold truncate">
                      {t.user?.name || t.user?.username || t.user?.email || "User"}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {t.user?.email}
                    </div>
                    <div className="mt-1 text-xs text-gray-300 truncate">
                      {last?.text || (last ? "(attachment)" : "No messages")}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat */}
        <section className="bg-[#0b1020] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="text-sm font-bold">
              {activeThread?.user?.name || activeThread?.user?.email || "Conversation"}
            </div>
            <div className="text-xs text-gray-400">{activeThread?.user?.email || ""}</div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => {
              const mine = m.sender === "SUPPORT";
              return (
                <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={[
                      "p-3 rounded-2xl max-w-[85%] border",
                      mine
                        ? "bg-blue-600 text-white border-blue-500/30"
                        : "bg-[#181d2b] text-gray-200 border-white/10",
                    ].join(" ")}
                  >
                    {m.text ? <div className="whitespace-pre-wrap">{m.text}</div> : null}

                    {Array.isArray(m.attachments) && m.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {m.attachments.map((a, idx) => {
                          const img = a.kind === "IMAGE" || isImageMime(a.mime);
                          if (img) {
                            return (
                              <a key={idx} href={a.url} target="_blank" rel="noreferrer" className="block">
                                <img src={a.url} alt={a.name || "attachment"} className="max-h-56 rounded-xl border border-white/10" />
                              </a>
                            );
                          }
                          return (
                            <a
                              key={idx}
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-sm underline underline-offset-4 text-white/90 hover:text-white"
                            >
                              📎 {a.name || "Attachment"}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Pending attachments */}
          {pendingFiles.length > 0 && (
            <div className="px-4 pb-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                <div className="text-xs text-gray-300 mb-2">Attachments ({pendingFiles.length})</div>
                <div className="flex flex-wrap gap-2">
                  {pendingFiles.map((a, i) => (
                    <div key={i} className="text-xs bg-white/5 border border-white/10 rounded-xl px-2 py-1 text-gray-200">
                      {a.kind === "IMAGE" ? "🖼️" : "📎"} {a.name || "file"}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {err && <div className="px-4 pb-2 text-sm text-rose-300">{err}</div>}

          {/* Composer */}
          <div className="p-3 border-t border-white/10 flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => uploadFiles(e.target.files)}
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="bg-white/5 border border-white/10 p-2 rounded-xl hover:bg-white/10"
              disabled={uploading || busy}
              aria-label="Attach file"
            >
              <FiPaperclip className="text-white" />
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Reply as support..."
              className="flex-1 bg-[#181d2b] text-white rounded-xl px-3 py-2 outline-none border border-white/10"
            />

            <button
              onClick={send}
              disabled={busy || uploading}
              className="bg-blue-600 px-3 py-2 rounded-xl hover:bg-blue-500 disabled:opacity-60"
              type="button"
            >
              <FiSend className="text-white" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
