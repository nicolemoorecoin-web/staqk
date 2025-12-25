// src/lib/admin_ops.ts

type UpdateArgs = {
  txId: string;
  status: "SUCCESS" | "FAILED";
  reason?: string;
};

type ApiOk = { ok: true } & Record<string, any>;
type ApiErr = { error: string };

async function apiFetch(input: string, init?: RequestInit): Promise<ApiOk> {
  const r = await fetch(input, { cache: "no-store", ...init });
  let j: any = {};
  try {
    j = await r.json();
  } catch {
    /* no body */
  }
  if (!r.ok) {
    const msg = (j && j.error) || `HTTP ${r.status}`;
    throw new Error(msg);
  }
  return j as ApiOk;
}

/** Approve/Reject via the new endpoints. */
export async function updateTxStatus({ txId, status, reason }: UpdateArgs) {
  if (!txId) throw new Error("Missing txId");

  if (status === "SUCCESS") {
    return apiFetch("/api/admin/tx/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txId }),
    });
  } else {
    return apiFetch("/api/admin/tx/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txId, reason: reason || "Rejected" }),
    });
  }
}

/** Syntactic sugar if you prefer explicit calls. */
export async function approveTx(txId: string) {
  return updateTxStatus({ txId, status: "SUCCESS" });
}
export async function rejectTx(txId: string, reason?: string) {
  return updateTxStatus({ txId, status: "FAILED", reason });
}

/** Optional helper to list pending tx for your admin screen. */
export async function listPendingTx() {
  return apiFetch("/api/admin/tx/list");
}
