"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* ───────── helpers ───────── */
const newId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;

// ✅ Normalize buckets: earn is REAL; earnWallet stays a legacy alias for investments
const syncBuckets = (buckets) => {
  const b = { ...(buckets || {}) };

  b.cash = Number(b.cash ?? 0) || 0;
  b.crypto = Number(b.crypto ?? 0) || 0;
  b.staking = Number(b.staking ?? 0) || 0;
  b.investments = Number(b.investments ?? 0) || 0;
  b.earn = Number(b.earn ?? 0) || 0;

  // legacy alias (some old UI may still read earnWallet for investments)
  b.earnWallet = b.investments;

  return b;
};

// ✅ total includes earn (because earn is now real)
const deriveTotal = (buckets) => {
  const b = buckets || {};
  return (
    (Number(b.cash) || 0) +
    (Number(b.crypto) || 0) +
    (Number(b.staking) || 0) +
    (Number(b.investments) || 0) +
    (Number(b.earn) || 0)
  );
};

/* ───────── simple fetch helpers ───────── */
async function getJSON(url) {
  const r = await fetch(url, { cache: "no-store" });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Request failed");
  return j;
}

async function postJSON(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body || {}),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.ok === false) throw new Error(j?.error || "Request failed");
  return j;
}

/* ───────── catalogue ───────── */
const CATALOG = [
  {
    id: "starter",
    name: "Starter Managed Account",
    min: 5000,
    pitch: "Conservative crypto/FX rotation with basic hedging. Great for getting started.",
    fee: "20% profit share",
    strategies: ["Volatility Capture Swing", "Cross-Asset Diversification"],
    risk: "Low–Moderate",
  },
  {
    id: "pro",
    name: "Professional Managed Account",
    min: 20000,
    pitch: "Dynamic hedged arbitrage and cross-exchange trading with personalized risk.",
    fee: "20% profit share + performance fee",
    strategies: ["Dynamic Hedged Arbitrage", "Algorithmic Swing Portfolio"],
    risk: "Moderate",
  },
  {
    id: "elite",
    name: "Elite Custom Strategy Account",
    min: 100000,
    pitch: "Custom portfolio across crypto/FX/metals with advanced quant strategies.",
    fee: "Custom",
    strategies: ["Quantitative Mean Reversion", "Cross-Asset Diversification", "Custom Blend"],
    risk: "Client-specific",
  },
  {
    id: "signals",
    name: "Self-Directed Trading Support",
    min: 0,
    pitch: "Signals, research, and optional coaching. DIY with pro guidance.",
    fee: "Flat monthly subscription",
    strategies: ["Signals & Coaching"],
    risk: "User-managed",
  },
];

/* ───────── store ───────── */
export const useWalletStore = create(
  persist(
    (set, get) => ({
      /* USER */
      user: {
        name: "user",
        email: "",
        username: "",
        staqksId: "",
        phone: "",
        dob: "",
        address: "",
        kycStatus: "Unverified",
        avatar: null,
      },

      /* THEME */
      theme: "dark",
      setTheme: (mode) => set({ theme: mode === "light" ? "light" : "dark" }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

      /* BALANCES */
      balances: {
        total: 0,
        income: 0,
        expense: 0,
        buckets: syncBuckets({
          crypto: 0,
          cash: 0,
          staking: 0,
          investments: 0,
          earn: 0,
        }),
      },

      withdrawableUsd: 0,
      setWithdrawableUsd: (usd) => set({ withdrawableUsd: Number(usd) || 0 }),

      /* TX */
      tx: [],

      /* INVESTMENTS */
      investmentProducts: CATALOG,
      investments: [], // server list cache (optional, but helps chart snapshots)
      investmentHistory: [],

      _hydrated: false,

      /* SETTERS */
      setUser: (u) => set({ user: { ...get().user, ...u } }),

      setBalances: (b) => {
        const s = get();
        const buckets = syncBuckets({
          ...(s.balances?.buckets || {}),
          ...(b?.buckets || {}),
        });

        set({
          balances: {
            total: deriveTotal(buckets),
            income: Number(b?.income ?? s.balances.income) || 0,
            expense: Number(b?.expense ?? s.balances.expense) || 0,
            buckets,
          },
        });
      },

      setInvestments: (items) => {
        set({ investments: Array.isArray(items) ? items : [] });
      },

      hydrateFromServer: async () => {
        try {
          const summary = await getJSON("/api/account/summary");
          if (summary?.buckets) {
            get().setBalances({
              buckets: summary.buckets,
              income: summary.incomeUsd,
              expense: summary.expenseUsd,
            });
          }
        } catch (e) {
          console.warn("hydrateFromServer:", e?.message || e);
        }
      },

      // ✅ Allow passing an investment list (so snapshots reflect the real server data)
      recordInvestmentSnapshot: (items) => {
        const list = Array.isArray(items) ? items : get().investments || [];
        const totalCurrent = list.reduce((sum, iv) => sum + (Number(iv.balance) || 0), 0);
        const next = [...(get().investmentHistory || []), { ts: Date.now(), value: totalCurrent }];
        set({ investmentHistory: next.slice(-200) });
      },

      /* SERVER-BACKED investment actions (kept as-is) */
      startInvestment: async ({ productId, strategy, amount, sourceBucket = "cash", productName }) => {
        const p = (get().investmentProducts || []).find((pp) => pp.id === productId);
        const min = Number(p?.min ?? 0);
        const a = Number(amount) || 0;

        if (!p) return { ok: false, error: "Invalid product" };
        if (!a || a <= 0) return { ok: false, error: "Amount must be > 0" };
        if (a < min) return { ok: false, error: `Minimum for ${p.name} is $${min.toLocaleString()}` };

        try {
          const res = await postJSON("/api/investments/move", {
            action: "START",
            amount: a,
            productId,
            productName: productName || p.name,
            strategy: strategy || p.strategies?.[0] || "Strategy",
            sourceBucket,
          });

          if (res?.buckets) get().setBalances({ buckets: res.buckets });
          await get().hydrateFromServer();
          // snapshot will be updated by investments page after it reloads list

          return { ok: true, id: res?.investment?.id };
        } catch (err) {
          return { ok: false, error: err?.message || "Start failed" };
        }
      },

      addToInvestment: async ({ investmentId, amount, sourceBucket = "cash" }) => {
        try {
          const res = await postJSON("/api/investments/move", {
            action: "TOPUP",
            investmentId,
            amount,
            sourceBucket,
          });

          if (res?.buckets) get().setBalances({ buckets: res.buckets });
          await get().hydrateFromServer();

          return { ok: true };
        } catch (err) {
          return { ok: false, error: err?.message || "Top-up failed" };
        }
      },

      withdrawFromInvestment: async ({ investmentId, amount, targetBucket = "cash" }) => {
        try {
          const res = await postJSON("/api/investments/move", {
            action: "WITHDRAW",
            investmentId,
            amount,
            targetBucket,
          });

          if (res?.buckets) get().setBalances({ buckets: res.buckets });
          await get().hydrateFromServer();

          return { ok: true };
        } catch (err) {
          return { ok: false, error: err?.message || "Withdraw failed" };
        }
      },
    }),
    {
      name: "staqk_wallet",
      storage: createJSONStorage(() => localStorage),
      version: 14,

      partialize: (state) => {
        const { investmentProducts, _hydrated, ...rest } = state;
        return rest;
      },

      migrate: (persisted) => {
        const u = persisted?.user || {};
        const ensureId =
          u.staqksId && String(u.staqksId).trim()
            ? u.staqksId
            : `STAQK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

        persisted.user = {
          name: u.name ?? "user",
          email: u.email ?? "",
          username: u.username ?? (u.email ? u.email.split("@")[0] : ""),
          staqksId: ensureId,
          phone: u.phone ?? "",
          dob: u.dob ?? "",
          address: u.address ?? "",
          kycStatus: u.kycStatus ?? "Unverified",
          avatar: u.avatar ?? null,
        };

        if (persisted?.transactions && !persisted?.tx) {
          persisted.tx = persisted.transactions;
          delete persisted.transactions;
        }

        if (!persisted?.balances) persisted.balances = {};
        if (!persisted?.balances?.buckets) persisted.balances.buckets = {};
        const b = persisted.balances.buckets;

        let investments = Number(b.investments ?? 0);
        const earnWallet = b.earnWallet != null ? Number(b.earnWallet) : null;

        if ((!b.investments && b.investments !== 0) && earnWallet != null) {
          investments = earnWallet;
        }

        let earn = Number(b.earn ?? 0);
        const mirrored =
          b.earn != null &&
          b.investments != null &&
          Number(b.earn) === Number(b.investments) &&
          (b.earnWallet == null || Number(b.earnWallet) === Number(b.investments));

        if (mirrored) earn = 0;

        persisted.balances.buckets = syncBuckets({
          crypto: Number(b.crypto ?? 0),
          cash: Number(b.cash ?? 0),
          staking: Number(b.staking ?? 0),
          investments,
          earn,
        });

        persisted.balances.total = deriveTotal(persisted.balances.buckets);

        if (persisted.theme !== "light" && persisted.theme !== "dark") persisted.theme = "dark";

        return persisted;
      },

      onRehydrateStorage: () => (state) => {
        if (state) state._hydrated = true;
      },
    }
  )
);
