"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCheck, FiClock } from "react-icons/fi";
import { useWalletStore } from "../../../lib/walletStore";
import { useAppPrefs } from "../../components/AppPrefsProvider";

const COUNTRIES = ["United States", "Canada", "United Kingdom", "Germany", "Mexico", "Australia"];
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "MXN", "AUD"];

const MIN_DOMESTIC = 5000;
const MIN_INTL = 20000;

const TXT = {
  en: {
    title: "Bank Transfer",
    available: "Available balance",
    cashHint: "USD cash balance",
    pendingTitle: "Transfer submitted — Pending",
    type: "Type",
    submitted: "Submitted",
    beneficiary: "Beneficiary",
    bank: "Bank",
    routing: "Routing (ABA)",
    account: "Account",
    country: "Country",
    currency: "Currency",
    swift: "SWIFT/BIC",
    iban: "IBAN/Acct",
    amount: "Amount",
    fee: "Fee",
    total: "Total Debit",
    schedule: "Schedule",
    reference: "Reference",
    done: "Done",
    domestic: "domestic",
    international: "international",
    beneficiaryName: "Beneficiary name",
    bankName: "Bank name",
    accountNo: "Account number",
    scheduleOn: "Schedule on",
    referenceOpt: "Reference (optional)",
    saveBeneficiary: "Save beneficiary for future transfers",
    review: "Review",
    confirm: "Confirm transfer",
    insufficient: "Insufficient balance.",
    minimum: "Minimum transfer is",
    feeNote: "Fees (demo):",
  },
  fr: {
    title: "Virement bancaire",
    available: "Solde disponible",
    cashHint: "Solde cash (USD)",
    pendingTitle: "Virement envoyé — En attente",
    type: "Type",
    submitted: "Envoyé",
    beneficiary: "Bénéficiaire",
    bank: "Banque",
    routing: "Routing (ABA)",
    account: "Compte",
    country: "Pays",
    currency: "Devise",
    swift: "SWIFT/BIC",
    iban: "IBAN/Compte",
    amount: "Montant",
    fee: "Frais",
    total: "Débit total",
    schedule: "Planification",
    reference: "Référence",
    done: "Terminé",
    domestic: "domestique",
    international: "international",
    beneficiaryName: "Nom du bénéficiaire",
    bankName: "Nom de la banque",
    accountNo: "Numéro de compte",
    scheduleOn: "Planifier le",
    referenceOpt: "Référence (optionnel)",
    saveBeneficiary: "Enregistrer le bénéficiaire",
    review: "Vérification",
    confirm: "Confirmer le virement",
    insufficient: "Solde insuffisant.",
    minimum: "Le minimum est",
    feeNote: "Frais (démo) :",
  },
  es: {
    title: "Transferencia bancaria",
    available: "Balance disponible",
    cashHint: "Balance en efectivo (USD)",
    pendingTitle: "Transferencia enviada — Pendiente",
    type: "Tipo",
    submitted: "Enviado",
    beneficiary: "Beneficiario",
    bank: "Banco",
    routing: "Routing (ABA)",
    account: "Cuenta",
    country: "País",
    currency: "Moneda",
    swift: "SWIFT/BIC",
    iban: "IBAN/Cuenta",
    amount: "Monto",
    fee: "Comisión",
    total: "Débito total",
    schedule: "Programación",
    reference: "Referencia",
    done: "Listo",
    domestic: "doméstica",
    international: "internacional",
    beneficiaryName: "Nombre del beneficiario",
    bankName: "Nombre del banco",
    accountNo: "Número de cuenta",
    scheduleOn: "Programar para",
    referenceOpt: "Referencia (opcional)",
    saveBeneficiary: "Guardar beneficiario",
    review: "Revisar",
    confirm: "Confirmar transferencia",
    insufficient: "Balance insuficiente.",
    minimum: "El mínimo es",
    feeNote: "Comisiones (demo):",
  },
  de: {
    title: "Banküberweisung",
    available: "Verfügbares Guthaben",
    cashHint: "USD Cash-Guthaben",
    pendingTitle: "Überweisung gesendet — Ausstehend",
    type: "Typ",
    submitted: "Gesendet",
    beneficiary: "Begünstigter",
    bank: "Bank",
    routing: "Routing (ABA)",
    account: "Konto",
    country: "Land",
    currency: "Währung",
    swift: "SWIFT/BIC",
    iban: "IBAN/Konto",
    amount: "Betrag",
    fee: "Gebühr",
    total: "Gesamtbelastung",
    schedule: "Termin",
    reference: "Referenz",
    done: "Fertig",
    domestic: "inland",
    international: "international",
    beneficiaryName: "Name des Empfängers",
    bankName: "Bankname",
    accountNo: "Kontonummer",
    scheduleOn: "Termin am",
    referenceOpt: "Referenz (optional)",
    saveBeneficiary: "Empfänger speichern",
    review: "Prüfen",
    confirm: "Überweisung bestätigen",
    insufficient: "Nicht genügend Guthaben.",
    minimum: "Minimum ist",
    feeNote: "Gebühren (Demo):",
  },
  ar: {
    title: "تحويل بنكي",
    available: "الرصيد المتاح",
    cashHint: "رصيد نقدي بالدولار",
    pendingTitle: "تم إرسال التحويل — قيد الانتظار",
    type: "النوع",
    submitted: "تم الإرسال",
    beneficiary: "المستفيد",
    bank: "البنك",
    routing: "Routing (ABA)",
    account: "الحساب",
    country: "الدولة",
    currency: "العملة",
    swift: "SWIFT/BIC",
    iban: "IBAN/الحساب",
    amount: "المبلغ",
    fee: "الرسوم",
    total: "إجمالي الخصم",
    schedule: "الجدولة",
    reference: "المرجع",
    done: "تم",
    domestic: "محلي",
    international: "دولي",
    beneficiaryName: "اسم المستفيد",
    bankName: "اسم البنك",
    accountNo: "رقم الحساب",
    scheduleOn: "جدولة في",
    referenceOpt: "مرجع (اختياري)",
    saveBeneficiary: "حفظ المستفيد",
    review: "مراجعة",
    confirm: "تأكيد التحويل",
    insufficient: "الرصيد غير كافٍ.",
    minimum: "الحد الأدنى هو",
    feeNote: "الرسوم (تجريبية):",
  },
  zh: {
    title: "银行转账",
    available: "可用余额",
    cashHint: "美元现金余额",
    pendingTitle: "已提交转账 — 处理中",
    type: "类型",
    submitted: "提交时间",
    beneficiary: "收款人",
    bank: "银行",
    routing: "Routing (ABA)",
    account: "账户",
    country: "国家",
    currency: "币种",
    swift: "SWIFT/BIC",
    iban: "IBAN/账户",
    amount: "金额",
    fee: "手续费",
    total: "总扣款",
    schedule: "日期",
    reference: "备注",
    done: "完成",
    domestic: "国内",
    international: "国际",
    beneficiaryName: "收款人姓名",
    bankName: "银行名称",
    accountNo: "账号",
    scheduleOn: "安排日期",
    referenceOpt: "备注（可选）",
    saveBeneficiary: "保存收款人",
    review: "确认信息",
    confirm: "确认转账",
    insufficient: "余额不足。",
    minimum: "最低为",
    feeNote: "手续费（演示）:",
  },
};

function pickLang(code) {
  const k = String(code || "en").toLowerCase();
  return TXT[k] ? k : "en";
}

export default function BankTransferPage() {
  const router = useRouter();
  const { language, locale, formatMoney } = useAppPrefs();
  const L = TXT[pickLang(language)];

  const storeCash = useWalletStore((s) => Number(s?.balances?.buckets?.cash || 0));

  const [cashBalance, setCashBalance] = useState(storeCash);

  useEffect(() => setCashBalance(storeCash), [storeCash]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/account/summary", { cache: "no-store" });
        if (!r.ok) return;
        const j = await r.json();

        const fromApi =
          Number(j.buckets?.cash ?? j.cash ?? j.cashUsd ?? j.total ?? j.totalUsd ?? 0) || 0;

        setCashBalance(fromApi);
      } catch (err) {
        console.error("Failed to load account summary for transfer page", err);
      }
    })();
  }, []);

  const [type, setType] = useState("domestic"); // 'domestic' | 'international'
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);

  const [recName, setRecName] = useState("");
  const [bankName, setBankName] = useState("");

  const [routing, setRouting] = useState("");
  const [acctNumber, setAcctNumber] = useState("");

  const [country, setCountry] = useState("United States");
  const [currency, setCurrency] = useState("USD");
  const [swift, setSwift] = useState("");
  const [iban, setIban] = useState("");

  const fee = useMemo(() => (type === "domestic" ? 5 : 35), [type]);
  const numericAmount = Number(amount) || 0;
  const debitTotal = useMemo(
    () => numericAmount + (numericAmount > 0 ? fee : 0),
    [numericAmount, fee]
  );

  const minRequired = type === "domestic" ? MIN_DOMESTIC : MIN_INTL;
  const meetsMin = numericAmount >= minRequired;

  const [submitted, setSubmitted] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const valid = useMemo(() => {
    if (numericAmount <= 0 || !meetsMin) return false;
    if (!recName || !bankName) return false;
    if (type === "domestic") {
      return /^\d{9}$/.test(routing) && acctNumber.trim().length >= 6;
    }
    return /^[A-Z0-9]{8,11}$/i.test(swift) && iban.trim().length >= 12 && !!country && !!currency;
  }, [numericAmount, meetsMin, recName, bankName, type, routing, acctNumber, swift, iban, country, currency]);

  const reviewRows = useMemo(() => {
    const rows = [
      ["From", "Main balance (cash)"],
      [L.beneficiary, recName || "—"],
      [L.bank, bankName || "—"],
    ];

    // ✅ FIX: compare with "domestic" not "Domestic"
    if (type === "domestic") {
      rows.push([L.routing, routing || "—"]);
      rows.push([L.account, mask(acctNumber)]);
    } else {
      rows.push([L.country, country || "—"]);
      rows.push([L.currency, currency || "—"]);
      rows.push([L.swift, swift || "—"]);
      rows.push([L.iban, maskIban(iban)]);
    }

    rows.push([L.amount, formatMoney(numericAmount)]);
    rows.push([L.fee, formatMoney(numericAmount ? fee : 0)]);
    rows.push([L.total, formatMoney(debitTotal)]);
    if (reference) rows.push([L.reference, reference]);
    rows.push([L.schedule, new Date(date).toLocaleDateString(locale || undefined)]);

    return rows;
  }, [L, type, recName, bankName, routing, acctNumber, country, currency, swift, iban, numericAmount, fee, debitTotal, reference, date, formatMoney, locale]);

  async function submit() {
    if (!valid) return;

    const meta = {
      transferType: type,
      beneficiary: recName,
      bankName,
      scheduleDate: date,
      reference,
      country: type === "international" ? country : undefined,
      currency: type === "international" ? currency : undefined,
      routing: type === "domestic" ? routing : undefined,
      account: type === "domestic" ? mask(acctNumber) : undefined,
      swift: type === "international" ? swift : undefined,
      iban: type === "international" ? maskIban(iban) : undefined,
      fee,
      debitTotal,
    };

    try {
      const res = await fetch("/api/tx/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountUsd: numericAmount,
          fee,
          typeLabel: type,
          meta,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Transfer API error", err);
        alert(err.error || "Could not submit transfer");
        return;
      }

      const data = await res.json();
      const ref = data?.tx?.id;

      useWalletStore.setState((s) => ({
        tx: [
          {
            id: ref || `local_${Date.now()}`,
            type: "TRANSFER",
            title: `Bank Transfer — ${cap(type)}`,
            amount: -(numericAmount + (numericAmount > 0 ? fee : 0)),
            currency: "USD",
            status: "PENDING",
            ts: Date.now(),
          },
          ...(s.tx || []),
        ],
      }));

      setReceipt({ ...meta, amount: numericAmount, ts: Date.now(), ref });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      alert("Network error submitting transfer");
    }
  }

  function done() {
    setSubmitted(false);
    setReceipt(null);
    router.push("/home");
  }

  return (
    <main className="min-h-[100dvh] bg-[#0b1020]" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="sticky top-0 z-10 bg-[#0b1020]/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white/80 hover:text-white">
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-white text-lg font-bold">{L.title}</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <Card>
          <SectionTitle>{L.available}</SectionTitle>
          <div className="mt-1 text-white text-xl font-extrabold">{formatMoney(cashBalance)}</div>
          <p className="text-white/60 text-xs mt-1">{L.cashHint}</p>
        </Card>

        {submitted && receipt ? (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/15 text-yellow-300">
                <FiClock />
              </span>
              <h2 className="text-white font-bold">{L.pendingTitle}</h2>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm">
              <KV k={L.type} v={cap(type)} />
              <KV k={L.submitted} v={new Date().toLocaleString(locale || undefined)} />
              <KV k={L.beneficiary} v={recName} />
              <KV k={L.bank} v={bankName} />
              {type === "domestic" ? (
                <>
                  <KV k={L.routing} v={routing} />
                  <KV k={L.account} v={mask(acctNumber)} />
                </>
              ) : (
                <>
                  <KV k={L.country} v={country} />
                  <KV k={L.currency} v={currency} />
                  <KV k={L.swift} v={swift} />
                  <KV k={L.iban} v={maskIban(iban)} />
                </>
              )}
              <KV k={L.amount} v={formatMoney(numericAmount)} />
              <KV k={L.fee} v={formatMoney(fee)} />
              <KV k={L.total} v={formatMoney(debitTotal)} />
              <KV k={L.schedule} v={new Date(date).toLocaleDateString(locale || undefined)} />
              {reference ? <KV k={L.reference} v={reference} full /> : null}
            </dl>

            <button
              onClick={done}
              className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 inline-flex items-center justify-center gap-2"
            >
              <FiCheck /> {L.done}
            </button>
          </Card>
        ) : (
          <>
            <Card>
              <div className="flex gap-2 rounded-xl p-1 bg-white/5">
                {["domestic", "international"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 rounded-lg font-semibold capitalize transition ${
                      type === t ? "bg-blue-600 text-white" : "text-white/80 hover:bg-white/[0.06]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={L.beneficiaryName}>
                  <input
                    value={recName}
                    onChange={(e) => setRecName(e.target.value)}
                    className="w-full bg-[#0f1424] border border-white/10 rounded-lg px-3 py-2 text-white"
                    placeholder="John Doe"
                  />
                </Field>
                <Field label={L.bankName}>
                  <input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-[#0f1424] border border-white/10 rounded-lg px-3 py-2 text-white"
                    placeholder="Bank of Example"
                  />
                </Field>
              </div>

              {type === "domestic" ? (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={L.routing}>
                    <input
                      value={routing}
                      onChange={(e) => setRouting(e.target.value.replace(/[^\d]/g, "").slice(0, 9))}
                      inputMode="numeric"
                      maxLength={9}
                      placeholder="9 digits"
                      className="w-full bg-[#0f1424] border border-white/10 rounded-lg px-3 py-2 text-white"
                    />
                  </Field>
                  <Field label={L.accountNo}>
                    <input
                      value={acctNumber}
                      onChange={(e) => setAcctNumber(e.target.value.replace(/\s/g, ""))}
                      placeholder="Recipient account number"
                      className="w-full bg-[#0f1424] border border-white/10 rounded-lg px-3 py-2 text-white"
                    />
                  </Field>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={L.country}>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-[#0f1424] border border-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label={L.currency}>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-[#0f1424] border border-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label={L.swift}>
                    <input
                      value={swift}
                      onChange={(e) =>
                        setSwift(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11))
                      }
                      placeholder="8–11 characters"
                      className="w-full bg-[#0f1424] border border-white/10 rounded-lg px-3 py-2 text-white"
                    />
                  </Field>
                  <Field label={L.iban}>
                    <input
                      value={iban}
                      onChange={(e) => setIban(e.target.value.toUpperCase().replace(/\s/g, ""))}
                      placeholder="Recipient IBAN or account"
                      className="w-full bg-[#0f1424] border border-white/10 rounded-lg px-3 py-2 text-white"
                    />
                  </Field>
                </div>
              )}
            </Card>

            <Card>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={`${L.amount} (USD) — minimum ${formatMoney(minRequired)}`}>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(sanitizeMoney(e.target.value))}
                    inputMode="decimal"
                    placeholder="0.00"
                    className={`w-full bg-[#0f1424] border rounded-lg px-3 py-2 text-white ${
                      meetsMin ? "border-white/10" : "border-rose-400/50"
                    }`}
                  />
                </Field>
                <Field label={L.scheduleOn}>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#0f1424] border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </Field>
              </div>

              <Field label={L.referenceOpt}>
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g., Invoice 1042"
                  className="w-full bg-[#0f1424] border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </Field>

              <label className="mt-3 flex items-center gap-2 text-white/80">
                <input
                  type="checkbox"
                  checked={saveBeneficiary}
                  onChange={(e) => setSaveBeneficiary(e.target.checked)}
                  className="h-4 w-4 rounded border-white/30"
                />
                {L.saveBeneficiary}
              </label>
            </Card>

            <Card>
              <SectionTitle>{L.review}</SectionTitle>
              <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                {reviewRows.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-white/70">{k}</dt>
                    <dd className="text-white font-medium text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <button
              disabled={!valid || debitTotal > cashBalance}
              className={`w-full rounded-xl py-3 font-semibold transition ${
                valid && debitTotal <= cashBalance
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-white/10 text-white/60 cursor-not-allowed"
              }`}
              onClick={submit}
            >
              {L.confirm}
            </button>

            {debitTotal > cashBalance && (
              <p className="text-sm text-rose-300">
                {L.insufficient} Available: {formatMoney(cashBalance)} • Required: {formatMoney(debitTotal)}
              </p>
            )}
            {!meetsMin && (
              <p className="text-sm text-rose-300">
                {L.minimum} {formatMoney(minRequired)}.
              </p>
            )}

            <p className="text-xs text-white/50">
              {L.feeNote} {formatMoney(fee)} ({type}). Additional correspondent/recipient bank fees may apply.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

/* —— UI bits —— */
function Card({ children }) {
  return <section className="rounded-2xl bg-[#0f1424] ring-1 ring-white/10 p-4 sm:p-5">{children}</section>;
}
function SectionTitle({ children }) {
  return <h2 className="text-white font-semibold text-sm">{children}</h2>;
}
function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-white/80 text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}
function KV({ k, v, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <dt className="text-white/70">{k}</dt>
      <dd className="text-white font-semibold break-all">{v}</dd>
    </div>
  );
}

/* —— utils —— */
function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
function mask(v) {
  if (!v) return "—";
  const c = v.replace(/\s/g, "");
  return c.length <= 4 ? c : "•••• " + c.slice(-4);
}
function maskIban(v) {
  if (!v) return "—";
  const c = v.replace(/\s/g, "");
  return c.slice(0, 4) + " •••• •••• •••• " + c.slice(-4);
}
function sanitizeMoney(v) {
  v = String(v || "").replace(/[^0-9.]/g, "");
  const parts = v.split(".");
  return parts.length > 1 ? parts[0] + "." + parts[1].slice(0, 2) : parts[0];
}
