// src/app/admin/tx/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import { listPendingTx, updateTxStatus } from "@/lib/admin_ops"; // if '@' alias isn't set, use ../../lib/admin_ops

function fmtMoney(n) {
  const v = Number(n || 0);
  return v.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function AdminTxPage() {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);       // page-level busy (initial load)
  const [rowBusy, setRowBusy] = useState({});    // per-row busy { [id]: true }
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const j = await listPendingTx();           // GET /api/admin/tx/list
      setRows(j.items || []);
    } catch (e) {
      setError(e.message || "Load failed");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onApprove(id) {
    setRowBusy((m) => ({ ...m, [id]: true }));
    setError("");
    try {
      await updateTxStatus({ txId: id, status: "SUCCESS" }); // POST /api/admin/tx/approve
      // optimistically remove the row without reloading the whole list
      setRows((xs) => xs.filter((r) => r.id !== id));
    } catch (e) {
      // if API says "already" or "Cannot approve tx in status ..." just reload
      if (String(e.message || "").toLowerCase().includes("already")
          || String(e.message || "").toLowerCase().includes("status")) {
        await load();
      } else {
        setError(e.message || "Approve failed");
      }
    } finally {
      setRowBusy((m) => ({ ...m, [id]: false }));
    }
  }

  async function onReject(id) {
    const reason = prompt("Reason for rejection?") || "Rejected";
    setRowBusy((m) => ({ ...m, [id]: true }));
    setError("");
    try {
      await updateTxStatus({ txId: id, status: "FAILED", reason }); // POST /api/admin/tx/reject
      setRows((xs) => xs.filter((r) => r.id !== id));
    } catch (e) {
      if (String(e.message || "").toLowerCase().includes("already")
          || String(e.message || "").toLowerCase().includes("status")) {
        await load();
      } else {
        setError(e.message || "Reject failed");
      }
    } finally {
      setRowBusy((m) => ({ ...m, [id]: false }));
    }
  }

  return (
    <main className="min-h-screen bg-[#0e1420] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin • Pending Transactions</h1>
          <button
            onClick={load}
            disabled={busy}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-600/20 border border-red-600/40 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-3">When</th>
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Title</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Asset</th>
                <th className="text-left p-3">Network</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-white/60" colSpan={8}>
                    {busy ? "Loading…" : "No pending transactions"}
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const disabled = !!rowBusy[r.id];
                return (
                  <tr key={r.id} className="border-t border-white/10">
                    <td className="p-3">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      {r.wallet?.user?.name ||
                        r.wallet?.user?.username ||
                        r.wallet?.user?.email}
                    </td>
                    <td className="p-3">{r.title}</td>
                    <td className="p-3 text-right">
                      {Number(r.amount) >= 0 ? "+" : "-"}$
                      {fmtMoney(Math.abs(r.amount))}
                    </td>
                    <td className="p-3">{r.type}</td>
                    <td className="p-3">{r.asset || "-"}</td>
                    <td className="p-3">{r.network || "-"}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onApprove(r.id)}
                          disabled={disabled}
                          className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50"
                          title={disabled ? "Working…" : "Approve"}
                        >
                          {disabled ? "…" : "Approve"}
                        </button>
                        <button
                          onClick={() => onReject(r.id)}
                          disabled={disabled}
                          className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 disabled:opacity-50"
                          title={disabled ? "Working…" : "Reject"}
                        >
                          {disabled ? "…" : "Reject"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-white/50 mt-4">
          Approve updates wallet balances once. Reject marks the transaction as failed.
        </p>
      </div>
    </main>
  );
}
