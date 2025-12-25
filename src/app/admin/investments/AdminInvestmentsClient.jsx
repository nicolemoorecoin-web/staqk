"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppPrefs } from "../../components/AppPrefsProvider";

const TXT = {
  en: {
    title: "Admin · Investments",
    none: "No investments yet.",
    client: "Client",
    name: "Name",
    principal: "Principal",
    balance: "Balance",
    pnl: "P&L",
    action: "Action",
    adjust: "Adjust P&L",
    modalTitle: "Adjust P&L",
    enter: "Enter a profit (+) or loss (-) amount.",
    balanceLine: "Balance",
    pnlLine: "P&L",
    placeholder: "e.g. 500 or -200",
    cancel: "Cancel",
    apply: "Apply",
    saving: "Saving…",
    failed: "Failed to apply P&L",
    err: "Error adjusting P&L",
  },
  fr: {
    title: "Admin · Investissements",
    none: "Aucun investissement.",
    client: "Client",
    name: "Nom",
    principal: "Principal",
    balance: "Solde",
    pnl: "P&L",
    action: "Action",
    adjust: "Ajuster P&L",
    modalTitle: "Ajuster P&L",
    enter: "Saisissez un profit (+) ou une perte (-).",
    balanceLine: "Solde",
    pnlLine: "P&L",
    placeholder: "ex. 500 ou -200",
    cancel: "Annuler",
    apply: "Appliquer",
    saving: "Enregistrement…",
    failed: "Impossible d’appliquer le P&L",
    err: "Erreur lors de l’ajustement",
  },
  es: {
    title: "Admin · Inversiones",
    none: "Aún no hay inversiones.",
    client: "Cliente",
    name: "Nombre",
    principal: "Principal",
    balance: "Balance",
    pnl: "P&L",
    action: "Acción",
    adjust: "Ajustar P&L",
    modalTitle: "Ajustar P&L",
    enter: "Ingresa una ganancia (+) o pérdida (-).",
    balanceLine: "Balance",
    pnlLine: "P&L",
    placeholder: "ej. 500 o -200",
    cancel: "Cancelar",
    apply: "Aplicar",
    saving: "Guardando…",
    failed: "No se pudo aplicar P&L",
    err: "Error al ajustar P&L",
  },
  de: {
    title: "Admin · Investments",
    none: "Noch keine Investments.",
    client: "Kunde",
    name: "Name",
    principal: "Einlage",
    balance: "Saldo",
    pnl: "Gewinn/Verlust",
    action: "Aktion",
    adjust: "P&L anpassen",
    modalTitle: "P&L anpassen",
    enter: "Bitte Profit (+) oder Verlust (-) eingeben.",
    balanceLine: "Saldo",
    pnlLine: "P&L",
    placeholder: "z.B. 500 oder -200",
    cancel: "Abbrechen",
    apply: "Anwenden",
    saving: "Speichern…",
    failed: "P&L konnte nicht angewendet werden",
    err: "Fehler beim Anpassen",
  },
  ar: {
    title: "المشرف · الاستثمارات",
    none: "لا توجد استثمارات بعد.",
    client: "العميل",
    name: "الاسم",
    principal: "رأس المال",
    balance: "الرصيد",
    pnl: "الربح/الخسارة",
    action: "إجراء",
    adjust: "تعديل الربح/الخسارة",
    modalTitle: "تعديل الربح/الخسارة",
    enter: "أدخل ربحًا (+) أو خسارة (-).",
    balanceLine: "الرصيد",
    pnlLine: "الربح/الخسارة",
    placeholder: "مثال: 500 أو -200",
    cancel: "إلغاء",
    apply: "تطبيق",
    saving: "جارٍ الحفظ…",
    failed: "فشل تطبيق الربح/الخسارة",
    err: "خطأ أثناء التعديل",
  },
  zh: {
    title: "管理员 · 投资",
    none: "暂无投资。",
    client: "客户",
    name: "名称",
    principal: "本金",
    balance: "余额",
    pnl: "盈亏",
    action: "操作",
    adjust: "调整盈亏",
    modalTitle: "调整盈亏",
    enter: "请输入盈利 (+) 或亏损 (-)。",
    balanceLine: "余额",
    pnlLine: "盈亏",
    placeholder: "例如：500 或 -200",
    cancel: "取消",
    apply: "应用",
    saving: "保存中…",
    failed: "应用盈亏失败",
    err: "调整盈亏出错",
  },
};

function pickLang(code) {
  const k = String(code || "en").toLowerCase();
  return TXT[k] ? k : "en";
}

export default function AdminInvestmentsClient({ initialRows }) {
  const router = useRouter();
  const { language, locale, formatMoney } = useAppPrefs();

  const L = useMemo(() => TXT[pickLang(language)], [language]);

  const [items, setItems] = useState(initialRows || []);
  const [selectedId, setSelectedId] = useState(null);
  const [delta, setDelta] = useState("");
  const [busy, setBusy] = useState(false);

  const selected = items.find((x) => x.id === selectedId) || null;

  async function applyDelta() {
    if (!selected) return;

    const d = Number(delta);
    if (!Number.isFinite(d) || d === 0) {
      alert(L.enter);
      return;
    }

    try {
      setBusy(true);

      const res = await fetch("/api/admin/investments/pnl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ investmentId: selected.id, delta: d }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) throw new Error(j.error || L.failed);

      setItems((prev) => prev.map((iv) => (iv.id === j.investment.id ? j.investment : iv)));

      setSelectedId(null);
      setDelta("");

      router.refresh();
    } catch (err) {
      alert(err?.message || L.err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <h1 className="text-2xl font-bold mb-4">{L.title}</h1>

      {items.length === 0 ? (
        <p className="text-slate-400">{L.none}</p>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-3 py-2 text-left">{L.client}</th>
                <th className="px-3 py-2 text-left">{L.name}</th>
                <th className="px-3 py-2 text-right">{L.principal}</th>
                <th className="px-3 py-2 text-right">{L.balance}</th>
                <th className="px-3 py-2 text-right">{L.pnl}</th>
                <th className="px-3 py-2 text-right">{L.action}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((iv) => (
                <tr key={iv.id} className="border-t border-slate-800">
                  <td className="px-3 py-2">{iv.clientName}</td>
                  <td className="px-3 py-2">{iv.name}</td>
                  <td className="px-3 py-2 text-right">{formatMoney(iv.principal)}</td>
                  <td className="px-3 py-2 text-right">{formatMoney(iv.balance)}</td>
                  <td className={"px-3 py-2 text-right " + (iv.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {formatMoney(iv.pnl)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600"
                      onClick={() => {
                        setSelectedId(iv.id);
                        setDelta("");
                      }}
                    >
                      {L.adjust}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">
              {L.modalTitle} · {selected.name}
            </h2>

            <p className="text-xs text-slate-300 mb-2">
              {L.balanceLine}: {formatMoney(selected.balance)} · {L.pnlLine}:{" "}
              <span className={selected.pnl >= 0 ? "text-emerald-400" : "text-red-400"}>
                {formatMoney(selected.pnl)}
              </span>
            </p>

            <input
              type="number"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder={L.placeholder}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm mb-3"
              inputMode="decimal"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedId(null);
                  setDelta("");
                }}
                className="px-3 py-1 rounded bg-slate-700"
                disabled={busy}
              >
                {L.cancel}
              </button>
              <button
                onClick={applyDelta}
                className="px-3 py-1 rounded bg-emerald-600 text-white"
                disabled={busy}
              >
                {busy ? L.saving : L.apply}
              </button>
            </div>

            {/* keep locale accessible if you ever need it later */}
            <div className="mt-3 text-[11px] text-slate-500">
              Locale: {locale}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
