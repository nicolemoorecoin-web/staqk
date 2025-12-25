// src/app/investments/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { useWalletStore } from "../../lib/walletStore";
import { useAppPrefs } from "../components/AppPrefsProvider";

/* ---- chart.js ---- */
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

/* ---- i18n ---- */
const TXT = {
  en: {
    investments: "Investments",
    subtitle: "Managed strategies that record your positions automatically.",
    cash: "Cash",
    crypto: "Crypto",

    totalPrincipal: "Total Principal",
    currentValue: "Current Value",
    totalPnl: "Total P&L",
    chartNote: "Chart tracks the combined current value of all investments.",

    accountTiers: "Account Tiers",
    tiersHint: "Pick a tier → funds move from balance → investment bucket",

    min: "Min",
    fee: "Fee",
    risk: "Risk",
    strategies: "Strategies",
    startInvestment: "Start Investment",
    startsAt: "Starts at",
    recordsAuto: "and records on this page automatically.",

    myInvestments: "My Investments",
    recordOnly: "Record-only mode",
    noInvestmentsYet: "No investments yet",
    noInvestmentsHint:
      "Choose an account tier above to start. Your investment will appear here immediately.",

    principal: "Principal",
    pnl: "P&L",
    lastUpdate: "Last Update",
    started: "Started",

    active: "active",

    depositFromBalance: "Deposit from Balance",
    adjustPnl: "Adjust P&L",
    adminOnlyIdEnsures: "Investment ID:",

    // modal
    fundingSource: "Funding source",
    strategy: "Strategy",
    amount: "Amount",
    from: "From",
    minimum: "Minimum",
    start: "Start",
    cancel: "Cancel",
    deposit: "Deposit",
    apply: "Apply",
    close: "Close",

    // sources
    cashBalance: "Cash balance",
    cryptoBalance: "Crypto balance",

    // admin pnl modal
    adjustTitle: "Adjust Profit / Loss (Admin)",
    currentValueRow: "Current Value",
    totalPnlRow: "Total P&L",
    pnlExplain:
      "Enter a positive number for profit (e.g. 250) or a negative number for loss (e.g. -120). This will also update the account balance bucket.",
    pnlAmount: "Profit / Loss amount",
    noteOpt: "Note (optional)",
    reason: "Reason / remark",

    // alerts
    enterValidAmount: "Enter a valid amount",
    minForThis: "Minimum for this account is",
    insufficientSource: "Insufficient balance in selected funding source",
    couldNotStart: "Could not start investment",
    depositFailed: "Deposit failed",
    investmentNotReady: "Investment not ready yet. Refresh and try again.",
    investmentNotFound: "Investment not found",
    enterPnlNumber: "Enter a profit/loss number (example: 250 or -120).",
    pnlUpdateFailed: "P&L update failed",
  },

  fr: {
    investments: "Investissements",
    subtitle: "Stratégies gérées qui enregistrent automatiquement vos positions.",
    cash: "Cash",
    crypto: "Crypto",
    totalPrincipal: "Capital total",
    currentValue: "Valeur actuelle",
    totalPnl: "P&L total",
    chartNote: "Le graphique suit la valeur actuelle totale de tous les investissements.",
    accountTiers: "Paliers de compte",
    tiersHint: "Choisissez un palier → fonds transférés du solde → investissement",
    min: "Min",
    fee: "Frais",
    risk: "Risque",
    strategies: "Stratégies",
    startInvestment: "Démarrer l’investissement",
    startsAt: "Démarre à",
    recordsAuto: "et s’enregistre automatiquement sur cette page.",
    myInvestments: "Mes investissements",
    recordOnly: "Mode enregistrement",
    noInvestmentsYet: "Aucun investissement",
    noInvestmentsHint:
      "Choisissez un palier ci-dessus pour démarrer. Il apparaîtra ici immédiatement.",
    principal: "Capital",
    pnl: "P&L",
    lastUpdate: "Dernière mise à jour",
    started: "Démarré",
    active: "actif",
    depositFromBalance: "Déposer depuis le solde",
    adjustPnl: "Ajuster P&L",
    adminOnlyIdEnsures: "ID investissement :",
    fundingSource: "Source de financement",
    strategy: "Stratégie",
    amount: "Montant",
    from: "Depuis",
    minimum: "Minimum",
    start: "Démarrer",
    cancel: "Annuler",
    deposit: "Déposer",
    apply: "Appliquer",
    close: "Fermer",
    cashBalance: "Solde cash",
    cryptoBalance: "Solde crypto",
    adjustTitle: "Ajuster Profit / Perte (Admin)",
    currentValueRow: "Valeur actuelle",
    totalPnlRow: "P&L total",
    pnlExplain:
      "Entrez un nombre positif pour un profit (ex : 250) ou négatif pour une perte (ex : -120). Cela mettra aussi à jour le solde.",
    pnlAmount: "Montant profit / perte",
    noteOpt: "Note (optionnel)",
    reason: "Raison / remarque",
    enterValidAmount: "Entrez un montant valide",
    minForThis: "Le minimum pour ce compte est",
    insufficientSource: "Solde insuffisant dans la source choisie",
    couldNotStart: "Impossible de démarrer l’investissement",
    depositFailed: "Échec du dépôt",
    investmentNotReady: "Investissement pas prêt. Actualisez et réessayez.",
    investmentNotFound: "Investissement introuvable",
    enterPnlNumber: "Entrez un profit/perte (ex : 250 ou -120).",
    pnlUpdateFailed: "Échec de la mise à jour du P&L",
  },

  es: {
    investments: "Inversiones",
    subtitle: "Estrategias gestionadas que registran tus posiciones automáticamente.",
    cash: "Efectivo",
    crypto: "Cripto",
    totalPrincipal: "Principal total",
    currentValue: "Valor actual",
    totalPnl: "P&L total",
    chartNote: "El gráfico muestra el valor actual combinado de todas las inversiones.",
    accountTiers: "Niveles de cuenta",
    tiersHint: "Elige un nivel → fondos pasan del balance → inversión",
    min: "Mín",
    fee: "Comisión",
    risk: "Riesgo",
    strategies: "Estrategias",
    startInvestment: "Iniciar inversión",
    startsAt: "Empieza en",
    recordsAuto: "y se registra automáticamente en esta página.",
    myInvestments: "Mis inversiones",
    recordOnly: "Modo registro",
    noInvestmentsYet: "Aún no hay inversiones",
    noInvestmentsHint:
      "Elige un nivel arriba para empezar. Tu inversión aparecerá aquí al instante.",
    principal: "Principal",
    pnl: "P&L",
    lastUpdate: "Última actualización",
    started: "Iniciada",
    active: "activa",
    depositFromBalance: "Depositar desde el balance",
    adjustPnl: "Ajustar P&L",
    adminOnlyIdEnsures: "ID de inversión:",
    fundingSource: "Fuente de fondos",
    strategy: "Estrategia",
    amount: "Monto",
    from: "Desde",
    minimum: "Mínimo",
    start: "Iniciar",
    cancel: "Cancelar",
    deposit: "Depositar",
    apply: "Aplicar",
    close: "Cerrar",
    cashBalance: "Balance en efectivo",
    cryptoBalance: "Balance cripto",
    adjustTitle: "Ajustar Ganancia / Pérdida (Admin)",
    currentValueRow: "Valor actual",
    totalPnlRow: "P&L total",
    pnlExplain:
      "Ingresa un número positivo para ganancia (ej: 250) o negativo para pérdida (ej: -120). Esto también actualizará el balance.",
    pnlAmount: "Monto ganancia / pérdida",
    noteOpt: "Nota (opcional)",
    reason: "Motivo / nota",
    enterValidAmount: "Ingresa un monto válido",
    minForThis: "El mínimo para esta cuenta es",
    insufficientSource: "Balance insuficiente en la fuente seleccionada",
    couldNotStart: "No se pudo iniciar la inversión",
    depositFailed: "Falló el depósito",
    investmentNotReady: "La inversión aún no está lista. Actualiza e intenta de nuevo.",
    investmentNotFound: "Inversión no encontrada",
    enterPnlNumber: "Ingresa una ganancia/pérdida (ej: 250 o -120).",
    pnlUpdateFailed: "Falló la actualización de P&L",
  },

  de: {
    investments: "Investments",
    subtitle: "Verwaltete Strategien, die deine Positionen automatisch erfassen.",
    cash: "Cash",
    crypto: "Krypto",
    totalPrincipal: "Gesamtes Kapital",
    currentValue: "Aktueller Wert",
    totalPnl: "Gesamt P&L",
    chartNote: "Diagramm zeigt den kombinierten aktuellen Wert aller Investments.",
    accountTiers: "Kontostufen",
    tiersHint: "Stufe wählen → Guthaben → Investment-Bucket",
    min: "Min",
    fee: "Gebühr",
    risk: "Risiko",
    strategies: "Strategien",
    startInvestment: "Investment starten",
    startsAt: "Startet ab",
    recordsAuto: "und wird automatisch auf dieser Seite erfasst.",
    myInvestments: "Meine Investments",
    recordOnly: "Nur-Aufzeichnung",
    noInvestmentsYet: "Noch keine Investments",
    noInvestmentsHint:
      "Wähle oben eine Kontostufe, um zu starten. Es erscheint sofort hier.",
    principal: "Kapital",
    pnl: "P&L",
    lastUpdate: "Letztes Update",
    started: "Gestartet",
    active: "aktiv",
    depositFromBalance: "Vom Guthaben einzahlen",
    adjustPnl: "P&L anpassen",
    adminOnlyIdEnsures: "Investment-ID:",
    fundingSource: "Finanzierungsquelle",
    strategy: "Strategie",
    amount: "Betrag",
    from: "Von",
    minimum: "Minimum",
    start: "Start",
    cancel: "Abbrechen",
    deposit: "Einzahlen",
    apply: "Anwenden",
    close: "Schließen",
    cashBalance: "Cash-Guthaben",
    cryptoBalance: "Krypto-Guthaben",
    adjustTitle: "Gewinn / Verlust anpassen (Admin)",
    currentValueRow: "Aktueller Wert",
    totalPnlRow: "Gesamt P&L",
    pnlExplain:
      "Positive Zahl = Gewinn (z.B. 250), negative Zahl = Verlust (z.B. -120). Aktualisiert auch den Kontosaldo.",
    pnlAmount: "Gewinn / Verlust",
    noteOpt: "Notiz (optional)",
    reason: "Grund / Notiz",
    enterValidAmount: "Gib einen gültigen Betrag ein",
    minForThis: "Minimum für dieses Konto ist",
    insufficientSource: "Nicht genug Guthaben in der gewählten Quelle",
    couldNotStart: "Investment konnte nicht gestartet werden",
    depositFailed: "Einzahlung fehlgeschlagen",
    investmentNotReady: "Investment noch nicht bereit. Aktualisieren und erneut versuchen.",
    investmentNotFound: "Investment nicht gefunden",
    enterPnlNumber: "Gib Gewinn/Verlust ein (z.B. 250 oder -120).",
    pnlUpdateFailed: "P&L-Update fehlgeschlagen",
  },

  ar: {
    investments: "الاستثمارات",
    subtitle: "استراتيجيات مُدارة تسجّل مراكزك تلقائيًا.",
    cash: "نقدي",
    crypto: "كريبتو",
    totalPrincipal: "إجمالي رأس المال",
    currentValue: "القيمة الحالية",
    totalPnl: "إجمالي الربح/الخسارة",
    chartNote: "المخطط يتتبع القيمة الحالية المجمعة لجميع الاستثمارات.",
    accountTiers: "مستويات الحساب",
    tiersHint: "اختر مستوى → تُخصم الأموال من الرصيد → إلى الاستثمار",
    min: "الحد الأدنى",
    fee: "الرسوم",
    risk: "المخاطر",
    strategies: "الاستراتيجيات",
    startInvestment: "بدء الاستثمار",
    startsAt: "يبدأ من",
    recordsAuto: "وسيظهر هنا تلقائيًا.",
    myInvestments: "استثماراتي",
    recordOnly: "وضع التسجيل فقط",
    noInvestmentsYet: "لا توجد استثمارات بعد",
    noInvestmentsHint: "اختر مستوى أعلاه للبدء. سيظهر الاستثمار هنا فورًا.",
    principal: "رأس المال",
    pnl: "الربح/الخسارة",
    lastUpdate: "آخر تحديث",
    started: "بدأ في",
    active: "نشط",
    depositFromBalance: "إيداع من الرصيد",
    adjustPnl: "تعديل الربح/الخسارة",
    adminOnlyIdEnsures: "معرّف الاستثمار:",
    fundingSource: "مصدر التمويل",
    strategy: "الاستراتيجية",
    amount: "المبلغ",
    from: "من",
    minimum: "الحد الأدنى",
    start: "بدء",
    cancel: "إلغاء",
    deposit: "إيداع",
    apply: "تطبيق",
    close: "إغلاق",
    cashBalance: "الرصيد النقدي",
    cryptoBalance: "رصيد الكريبتو",
    adjustTitle: "تعديل ربح / خسارة (مسؤول)",
    currentValueRow: "القيمة الحالية",
    totalPnlRow: "إجمالي الربح/الخسارة",
    pnlExplain:
      "اكتب رقمًا موجبًا للربح (مثال 250) أو سالبًا للخسارة (مثال -120). هذا سيحدّث رصيد الحساب أيضًا.",
    pnlAmount: "مبلغ الربح/الخسارة",
    noteOpt: "ملاحظة (اختياري)",
    reason: "سبب / ملاحظة",
    enterValidAmount: "أدخل مبلغًا صحيحًا",
    minForThis: "الحد الأدنى لهذا الحساب هو",
    insufficientSource: "الرصيد غير كافٍ في مصدر التمويل المختار",
    couldNotStart: "تعذر بدء الاستثمار",
    depositFailed: "فشل الإيداع",
    investmentNotReady: "الاستثمار غير جاهز بعد. حدّث الصفحة وأعد المحاولة.",
    investmentNotFound: "لم يتم العثور على الاستثمار",
    enterPnlNumber: "أدخل رقم ربح/خسارة (مثال 250 أو -120).",
    pnlUpdateFailed: "فشل تحديث الربح/الخسارة",
  },

  zh: {
    investments: "投资",
    subtitle: "托管策略会自动记录你的持仓。",
    cash: "现金",
    crypto: "加密",
    totalPrincipal: "总本金",
    currentValue: "当前价值",
    totalPnl: "总盈亏",
    chartNote: "图表跟踪所有投资的合计当前价值。",
    accountTiers: "账户等级",
    tiersHint: "选择等级 → 资金从余额转入 → 投资账户",
    min: "最低",
    fee: "费用",
    risk: "风险",
    strategies: "策略",
    startInvestment: "开始投资",
    startsAt: "起投",
    recordsAuto: "并会自动显示在此页。",
    myInvestments: "我的投资",
    recordOnly: "仅记录模式",
    noInvestmentsYet: "暂无投资",
    noInvestmentsHint: "在上方选择一个等级开始，投资会立刻出现在这里。",
    principal: "本金",
    pnl: "盈亏",
    lastUpdate: "最后更新",
    started: "开始于",
    active: "进行中",
    depositFromBalance: "从余额充值",
    adjustPnl: "调整盈亏",
    adminOnlyIdEnsures: "投资ID：",
    fundingSource: "资金来源",
    strategy: "策略",
    amount: "金额",
    from: "来源",
    minimum: "最低",
    start: "开始",
    cancel: "取消",
    deposit: "充值",
    apply: "应用",
    close: "关闭",
    cashBalance: "现金余额",
    cryptoBalance: "加密余额",
    adjustTitle: "调整盈利/亏损（管理员）",
    currentValueRow: "当前价值",
    totalPnlRow: "总盈亏",
    pnlExplain:
      "输入正数表示盈利（如 250），负数表示亏损（如 -120）。也会同步更新账户余额。",
    pnlAmount: "盈利/亏损金额",
    noteOpt: "备注（可选）",
    reason: "原因/备注",
    enterValidAmount: "请输入有效金额",
    minForThis: "该账户最低为",
    insufficientSource: "所选资金来源余额不足",
    couldNotStart: "无法开始投资",
    depositFailed: "充值失败",
    investmentNotReady: "投资尚未准备好，请刷新后重试。",
    investmentNotFound: "未找到该投资",
    enterPnlNumber: "请输入盈亏数字（如 250 或 -120）。",
    pnlUpdateFailed: "盈亏更新失败",
  },
};

function pickLang(code) {
  const k = String(code || "en").toLowerCase();
  return TXT[k] ? k : "en";
}

/* ---- money helpers ---- */
function pct(pnl, principal) {
  const p = Number(principal) || 0;
  if (p <= 0) return 0;
  return (Number(pnl) / p) * 100;
}

export default function InvestmentsPage() {
  const { language, locale, formatMoney, currency, currencyCode } = useAppPrefs();
  const L = TXT[pickLang(language)];
  const dir = String(language || "").toLowerCase() === "ar" ? "rtl" : "ltr";
  const displayCurrency = currencyCode || currency || "USD";

  // store selectors
  const products = useWalletStore((s) => s.investmentProducts || []);
  const history = useWalletStore((s) => s.investmentHistory || []);
  const recordSnapshot = useWalletStore((s) => s.recordInvestmentSnapshot);

  const startInv = useWalletStore((s) => s.startInvestment);
  const topUp = useWalletStore((s) => s.addToInvestment);
  const withdrawInv = useWalletStore((s) => s.withdrawFromInvestment);

  const buckets = useWalletStore((s) => s.balances?.buckets || {});
  const hydrate = useWalletStore((s) => s.hydrateFromServer);

  const cashBal = Number(buckets.cash || 0);
  const cryptoBal = Number(buckets.crypto || 0);

  const [investments, setInvestments] = useState([]);

  async function loadInvestments() {
    try {
      const r = await fetch("/api/investments", { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j?.ok) {
        const items = j.items || [];
        setInvestments(items);

        // ✅ keep zustand state in sync WITHOUT changing walletStore.js
        // (walletStore has `investments` but no public setter)
        useWalletStore.setState({ investments: items });

        // snapshot uses store.investments, so call after setState
        recordSnapshot();
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadInvestments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // hydrate server state on first mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  /* ------------ isAdmin flag (only show controls with ?admin=1) ------------ */
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = window.location.search || "";
    setIsAdmin(q.includes("admin=1"));
  }, []);

  /* ------------ totals ------------ */
  const totalPrincipal = useMemo(
    () => investments.reduce((sum, iv) => sum + (Number(iv.principal) || 0), 0),
    [investments]
  );
  const totalCurrent = useMemo(
    () => investments.reduce((sum, iv) => sum + (Number(iv.balance) || 0), 0),
    [investments]
  );
  const totalPnl = useMemo(
    () => investments.reduce((sum, iv) => sum + (Number(iv.pnl) || 0), 0),
    [investments]
  );
  const pnlClass = totalPnl >= 0 ? "text-emerald-400" : "text-rose-400";

  // chart model
  const chartData = useMemo(() => {
    const points = (history || []).slice(-60);
    const labels = points.map((p) => new Date(p.ts).toLocaleTimeString(locale || undefined));
    const data = points.map((p) => p.value);
    const rising = data.length > 1 ? data[data.length - 1] >= data[0] : true;

    return {
      labels,
      datasets: [
        {
          data,
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 0,
          borderColor: rising ? "rgba(16,185,129,1)" : "rgba(244,63,94,1)",
          backgroundColor: rising ? "rgba(16,185,129,0.14)" : "rgba(244,63,94,0.14)",
        },
      ],
    };
  }, [history, locale]);

  const chartOpts = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
    scales: {
      x: { ticks: { display: false }, grid: { display: false } },
      y: { ticks: { display: false }, grid: { display: false } },
    },
  };

  /* ----------------- modal state ----------------- */
  const [showStart, setShowStart] = useState(null); // productId
  const [showTopUp, setShowTopUp] = useState(null); // investmentId
  const [showWithdraw, setShowWithdraw] = useState(null); // investmentId
  const [showPnl, setShowPnl] = useState(null); // investmentId

  const [amount, setAmount] = useState("");
  const [strategy, setStrategy] = useState("");
  const [fundingSource, setFundingSource] = useState("cash"); // "cash" | "crypto"

  // pnl modal inputs
  const [pnlDelta, setPnlDelta] = useState("");
  const [pnlNote, setPnlNote] = useState("");

  const sourceBucket = fundingSource === "crypto" ? "crypto" : "cash";
  const sourceBalance = sourceBucket === "crypto" ? cryptoBal : cashBal;

  const closeAll = () => {
    setShowStart(null);
    setShowTopUp(null);
    setShowWithdraw(null);
    setShowPnl(null);

    setAmount("");
    setFundingSource("cash");

    setPnlDelta("");
    setPnlNote("");
  };

  /* ----------------- actions ----------------- */
  const doStart = async (product) => {
    const a = Number(amount);
    if (a <= 0) return alert(L.enterValidAmount);
    if (a < product.min) return alert(`${L.minForThis} ${formatMoney(product.min)}`);
    if (a > sourceBalance) return alert(L.insufficientSource);

    const res = await startInv({
      productId: product.id,
      productName: product.name,
      strategy: strategy || product.strategies?.[0],
      amount: a,
      sourceBucket,
    });

    if (!res?.ok) return alert(res.error || L.couldNotStart);
    closeAll();
    await hydrate();
    await loadInvestments();
  };

  const doTopUp = async (iv) => {
    const a = Number(amount);
    if (a <= 0) return alert(L.enterValidAmount);
    if (a > sourceBalance) return alert(L.insufficientSource);

    const investmentId = String(iv?.id || "").trim();
    if (!investmentId) return alert(L.investmentNotReady);

    const res = await topUp({ investmentId, amount: a, sourceBucket });
    if (!res?.ok) return alert(res.error || L.depositFailed);

    closeAll();
    await hydrate();
    await loadInvestments();
  };

  // ✅ withdraw to CASH (so user can withdraw externally)
  const doWithdraw = async (iv, overrideAmount) => {
    const investmentId = String(iv?.id || "").trim();
    if (!investmentId) return alert(L.investmentNotFound);

    const ivBal = Number(iv?.balance || 0);
    const a = Number(overrideAmount ?? amount);

    if (!Number.isFinite(a) || a <= 0) return alert(L.enterValidAmount);
    if (a > ivBal) return alert("Insufficient investment balance");

    const res = await withdrawInv({
      investmentId,
      amount: a,
      targetBucket: "cash",
    });

    if (!res?.ok) return alert(res.error || "Withdraw failed");

    closeAll();
    await hydrate();
    await loadInvestments();
  };

  // ✅ withdraw ALL balance to cash
  const doWithdrawAll = async (iv) => {
    const ivBal = Number(iv?.balance || 0);
    if (ivBal <= 0) return alert("No balance to withdraw");
    return doWithdraw(iv, ivBal);
  };

  const doAdjustPnl = async (iv) => {
    const id = String(iv?.id || "").trim();
    if (!id) return alert(L.investmentNotFound);

    const d = Number(pnlDelta);
    if (!Number.isFinite(d) || d === 0) return alert(L.enterPnlNumber);

    try {
      const r = await fetch("/api/investments/pnl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ investmentId: id, deltaPnl: d, note: pnlNote || "" }),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok || j?.ok === false) throw new Error(j?.error || L.pnlUpdateFailed);

      if (j?.buckets) useWalletStore.getState().setBalances({ buckets: j.buckets });

      await hydrate();
      recordSnapshot();
      closeAll();
      await loadInvestments();
    } catch (e) {
      alert(e?.message || L.pnlUpdateFailed);
    }
  };

  /* ----------------- filtered / ordered tiers ----------------- */
  const tierProducts = useMemo(() => {
    return products
      .filter((p) => p.name !== "Self-Directed Trading Support")
      .sort((a, b) => (a.min || 0) - (b.min || 0));
  }, [products]);

  return (
    <main className="min-h-[100dvh] bg-[#0b0f1a]" dir={dir}>
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-gradient-to-b from-blue-600/15 via-transparent to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 pt-6 pb-28">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h1 className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight">
              {L.investments}
            </h1>
            <p className="text-gray-400 text-sm mt-1">{L.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge label={L.cash} value={formatMoney(cashBal)} />
            <Badge label={L.crypto} value={formatMoney(cryptoBal)} />
          </div>
        </div>

        {/* Summary / Chart */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-[#0f1628]/70 backdrop-blur p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label={L.totalPrincipal} value={formatMoney(totalPrincipal)} />
              <Stat label={L.currentValue} value={formatMoney(totalCurrent)} />
              <Stat
                label={L.totalPnl}
                value={
                  <span className={pnlClass}>
                    {formatMoney(totalPnl)} (
                    {pct(totalPnl, totalPrincipal || totalCurrent).toFixed(2)}%)
                  </span>
                }
              />
            </div>

            <div className="sm:w-[360px] w-full">
              <div className="rounded-xl border border-white/10 bg-[#0b1020] p-3">
                <Line data={chartData} options={chartOpts} height={70} />
              </div>
              <p className="text-[11px] text-gray-500 mt-2">{L.chartNote}</p>
            </div>
          </div>
        </section>

        {/* Account tiers */}
        <section className="mb-10">
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-white font-bold text-lg">{L.accountTiers}</h2>
            <span className="text-xs text-gray-500">{L.tiersHint}</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {tierProducts.map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border border-white/10 bg-[#0f1628]/70 backdrop-blur p-4 hover:border-blue-400/30 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-white font-bold">{p.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{p.pitch}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Pill label={`${L.min}: ${formatMoney(p.min)}`} />
                      <Pill label={`${L.fee}: ${p.fee}`} />
                      <Pill label={`${L.risk}: ${p.risk}`} />
                    </div>

                    {p.strategies?.length ? (
                      <div className="text-xs text-gray-400 mt-3">
                        {L.strategies}: {p.strategies.join(" • ")}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => {
                      setShowStart(p.id);
                      setStrategy(p.strategies?.[0] || "Strategy");
                      setFundingSource("cash");
                      setAmount("");
                    }}
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 transition"
                  >
                    {L.startInvestment}
                  </button>

                  <div className="text-[11px] text-gray-500 mt-2">
                    {L.startsAt} {formatMoney(p.min)} {L.recordsAuto}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* My Investments */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-white font-bold text-lg">{L.myInvestments}</h2>
            <span className="text-xs text-gray-500">{L.recordOnly}</span>
          </div>

          {!investments || investments.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#0f1628]/70 backdrop-blur p-6">
              <div className="text-white font-bold">{L.noInvestmentsYet}</div>
              <p className="text-gray-400 text-sm mt-1">{L.noInvestmentsHint}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {investments.map((iv) => {
                const pnlPct = pct(iv.pnl, iv.principal);
                const rowPnlClass = Number(iv.pnl) >= 0 ? "text-emerald-400" : "text-rose-400";

                return (
                  <article
                    key={iv.id}
                    className="rounded-2xl border border-white/10 bg-[#0f1628]/70 backdrop-blur p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-white font-bold text-base sm:text-lg">{iv.name}</h3>
                        <div className="text-gray-400 text-sm">{iv.strategy}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {L.started}{" "}
                          {iv.startTs ? new Date(iv.startTs).toLocaleDateString(locale || undefined) : "—"}
                        </div>
                      </div>

                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                          iv.status === "active"
                            ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                            : "border-white/10 bg-white/5 text-gray-300"
                        }`}
                      >
                        {iv.status || L.active}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
                      <Data label={L.principal} value={formatMoney(iv.principal)} />
                      <Data label={L.currentValue} value={formatMoney(iv.balance)} />
                      <Data
                        label={L.pnl}
                        value={
                          <span className={rowPnlClass}>
                            {formatMoney(iv.pnl)} ({pnlPct.toFixed(2)}%)
                          </span>
                        }
                      />
                      <Data
                        label={L.lastUpdate}
                        value={iv.lastUpdate ? new Date(iv.lastUpdate).toLocaleString(locale || undefined) : "—"}
                      />
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => {
                          setShowTopUp(iv.id);
                          setFundingSource("cash");
                          setAmount("");
                        }}
                        className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 transition"
                      >
                        {L.depositFromBalance}
                      </button>

                      <button
                        onClick={() => {
                          setShowWithdraw(iv.id);
                          setAmount("");
                        }}
                        className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 border border-white/10 transition"
                        title="Withdraw funds back to Cash"
                      >
                        Withdraw to Cash
                      </button>

                      {isAdmin ? (
                        <button
                          onClick={() => {
                            setShowPnl(iv.id);
                            setPnlDelta("");
                            setPnlNote("");
                          }}
                          className="sm:w-[220px] w-full rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 border border-white/10 transition"
                          title="Admin: adjust profit/loss"
                        >
                          {L.adjustPnl}
                        </button>
                      ) : null}
                    </div>

                    {isAdmin ? (
                      <div className="mt-3 text-[12px] text-gray-500">
                        {L.adminOnlyIdEnsures} <span className="text-gray-300">{String(iv.id)}</span>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ---------------- MODALS ---------------- */}
        {showStart && (
          <Modal onClose={closeAll} title={L.startInvestment}>
            {(() => {
              const p = tierProducts.find((x) => x.id === showStart);
              if (!p) return null;

              const fromLabel = sourceBucket === "crypto" ? L.crypto : L.cash;

              return (
                <>
                  <div className="text-gray-400 text-sm mb-3">{p.name}</div>

                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-gray-300 text-sm">{L.fundingSource}</span>
                      <select
                        value={fundingSource}
                        onChange={(e) => setFundingSource(e.target.value)}
                        className="mt-1 w-full bg-[#0b1020] border border-white/10 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="cash">
                          {L.cashBalance} ({formatMoney(cashBal)})
                        </option>
                        <option value="crypto">
                          {L.cryptoBalance} ({formatMoney(cryptoBal)})
                        </option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-gray-300 text-sm">{L.strategy}</span>
                      <select
                        value={strategy}
                        onChange={(e) => setStrategy(e.target.value)}
                        className="mt-1 w-full bg-[#0b1020] border border-white/10 rounded-xl px-3 py-2 text-white"
                      >
                        {(p.strategies || ["Strategy"]).map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-gray-300 text-sm">
                        {L.amount} ({displayCurrency})
                      </span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={String(p.min)}
                        className="mt-1 w-full bg-[#0b1020] border border-white/10 rounded-xl px-3 py-2 text-white"
                      />
                    </label>

                    <div className="text-xs text-gray-400">
                      {L.from} {fromLabel}:{" "}
                      <span className="text-white font-semibold">{formatMoney(sourceBalance)}</span> ·{" "}
                      {L.minimum}: {formatMoney(p.min)}
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => doStart(p)}
                        className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 transition"
                      >
                        {L.start}
                      </button>
                      <button
                        onClick={closeAll}
                        className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 font-bold py-2.5 border border-white/10 transition"
                      >
                        {L.cancel}
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </Modal>
        )}

        {showTopUp && (
          <Modal onClose={closeAll} title={L.depositFromBalance}>
            {(() => {
              const iv = investments.find((x) => x.id === showTopUp);
              if (!iv) return null;

              const fromLabel = sourceBucket === "crypto" ? L.crypto : L.cash;

              return (
                <>
                  <div className="text-gray-400 text-sm mb-3">
                    {iv.name} — {iv.strategy}
                  </div>

                  <label className="block">
                    <span className="text-gray-300 text-sm">{L.fundingSource}</span>
                    <select
                      value={fundingSource}
                      onChange={(e) => setFundingSource(e.target.value)}
                      className="mt-1 w-full bg-[#0b1020] border border-white/10 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="cash">
                        {L.cashBalance} ({formatMoney(cashBal)})
                      </option>
                      <option value="crypto">
                        {L.cryptoBalance} ({formatMoney(cryptoBal)})
                      </option>
                    </select>
                  </label>

                  <label className="block mt-3">
                    <span className="text-gray-300 text-sm">
                      {L.amount} ({displayCurrency})
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="mt-1 w-full bg-[#0b1020] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </label>

                  <div className="text-xs text-gray-400 mt-2">
                    {L.from} {fromLabel}:{" "}
                    <span className="text-white font-semibold">{formatMoney(sourceBalance)}</span>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => doTopUp(iv)}
                      className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 transition"
                    >
                      {L.deposit}
                    </button>
                    <button
                      onClick={closeAll}
                      className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 font-bold py-2.5 border border-white/10 transition"
                    >
                      {L.cancel}
                    </button>
                  </div>
                </>
              );
            })()}
          </Modal>
        )}

        {/* ✅ Withdraw modal (credits to CASH) + Withdraw All */}
        {showWithdraw && (
          <Modal onClose={closeAll} title="Withdraw to Cash">
            {(() => {
              const iv = investments.find((x) => x.id === showWithdraw);
              if (!iv) return null;

              const ivBal = Number(iv.balance || 0);

              return (
                <>
                  <div className="text-gray-400 text-sm mb-3">
                    {iv.name} — {iv.strategy}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Available in investment</span>
                      <span className="text-white font-semibold">{formatMoney(ivBal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-300 mt-1">
                      <span>Credits to</span>
                      <span className="text-white font-semibold">Cash balance</span>
                    </div>
                  </div>

                  <label className="block mt-3">
                    <span className="text-gray-300 text-sm">
                      {L.amount} ({displayCurrency})
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="mt-1 w-full bg-[#0b1020] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </label>

                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setAmount(String(ivBal || 0))}
                      className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 font-bold py-2 border border-white/10 transition"
                      title="Set amount to full balance"
                    >
                      MAX
                    </button>
                    <button
                      type="button"
                      onClick={() => doWithdrawAll(iv)}
                      className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 transition"
                      title="Withdraw all to Cash"
                    >
                      Withdraw All
                    </button>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => doWithdraw(iv)}
                      className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 transition"
                    >
                      Withdraw
                    </button>
                    <button
                      onClick={closeAll}
                      className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 font-bold py-2.5 border border-white/10 transition"
                    >
                      {L.cancel}
                    </button>
                  </div>
                </>
              );
            })()}
          </Modal>
        )}

        {showPnl && isAdmin && (
          <Modal onClose={closeAll} title={L.adjustTitle}>
            {(() => {
              const iv = investments.find((x) => x.id === showPnl);
              if (!iv) return null;

              return (
                <>
                  <div className="text-gray-400 text-sm mb-3">
                    {iv.name} — {iv.strategy}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>{L.currentValueRow}</span>
                      <span className="text-white font-semibold">{formatMoney(iv.balance)}</span>
                    </div>
                    <div className="flex justify-between text-gray-300 mt-1">
                      <span>{L.totalPnlRow}</span>
                      <span className="text-white font-semibold">{formatMoney(iv.pnl)}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-2">{L.pnlExplain}</div>
                  </div>

                  <label className="block mt-3">
                    <span className="text-gray-300 text-sm">{L.pnlAmount}</span>
                    <input
                      type="number"
                      value={pnlDelta}
                      onChange={(e) => setPnlDelta(e.target.value)}
                      placeholder="e.g. 250 or -120"
                      className="mt-1 w-full bg-[#0b1020] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </label>

                  <label className="block mt-3">
                    <span className="text-gray-300 text-sm">{L.noteOpt}</span>
                    <input
                      type="text"
                      value={pnlNote}
                      onChange={(e) => setPnlNote(e.target.value)}
                      placeholder={L.reason}
                      className="mt-1 w-full bg-[#0b1020] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </label>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => doAdjustPnl(iv)}
                      className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 transition"
                    >
                      {L.apply}
                    </button>
                    <button
                      onClick={closeAll}
                      className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 font-bold py-2.5 border border-white/10 transition"
                    >
                      {L.cancel}
                    </button>
                  </div>
                </>
              );
            })()}
          </Modal>
        )}
      </div>
    </main>
  );
}

/* ---------- small components ---------- */
function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-gray-400 text-xs">{label}</div>
      <div className="text-white font-extrabold text-lg">{value}</div>
    </div>
  );
}

function Data({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-gray-400 text-xs">{label}</div>
      <div className="text-white font-semibold">{value}</div>
    </div>
  );
}

function Badge({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-[10px] text-gray-400">{label}</div>
      <div className="text-white text-sm font-bold">{value}</div>
    </div>
  );
}

function Pill({ label }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-gray-300">
      {label}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1628] p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}