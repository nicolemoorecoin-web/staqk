// src/lib/walletStore.js
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useWalletStore = create(
  persist(
    (set, get) => ({
      user: { name: 'Henry', email: '' },

      // ✅ include income & expense here
      balances: {
        total: 12500,
        income: 2450,
        expense: 920,
        buckets: { crypto: 8350, cash: 3000, staking: 800, earnWallet: 350 },
      },

      tx: [],

      setUser: (u) => set({ user: { ...get().user, ...u } }),
      setBalances: (b) => set({ balances: { ...get().balances, ...b } }),

      deposit: (amount, bucket = 'cash') => {
        const s = get();
        const b = {
          ...s.balances.buckets,
          [bucket]: (s.balances.buckets[bucket] || 0) + amount,
        };
        set({
          balances: {
            total: s.balances.total + amount,
            income: (s.balances.income || 0) + amount,     // ✅ track income
            expense: s.balances.expense || 0,
            buckets: b,
          },
          tx: [
            { id: crypto.randomUUID(), type: 'DEPOSIT', amount, bucket, ts: Date.now() },
            ...s.tx,
          ],
        });
      },

      withdraw: (amount, bucket = 'cash') => {
        const s = get();
        const b = {
          ...s.balances.buckets,
          [bucket]: (s.balances.buckets[bucket] || 0) - amount,
        };
        set({
          balances: {
            total: s.balances.total - amount,
            income: s.balances.income || 0,
            expense: (s.balances.expense || 0) + amount,    // ✅ track expense
            buckets: b,
          },
          tx: [
            { id: crypto.randomUUID(), type: 'WITHDRAW', amount, bucket, ts: Date.now() },
            ...s.tx,
          ],
        });
      },

      transfer: (amount, from = 'cash', to = 'crypto') => {
        const s = get();
        const b = {
          ...s.balances.buckets,
          [from]: (s.balances.buckets[from] || 0) - amount,
          [to]: (s.balances.buckets[to] || 0) + amount,
        };
        set({
          balances: {
            ...s.balances,
            // total/income/expense unchanged for internal transfers
            buckets: b,
          },
          tx: [
            { id: crypto.randomUUID(), type: 'TRANSFER', amount, from, to, ts: Date.now() },
            ...s.tx,
          ],
        });
      },
    }),
    {
      name: 'staqk_wallet',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
