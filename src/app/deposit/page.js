"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiCopy,
  FiCreditCard,
  FiArrowLeft,
  FiUploadCloud,
  FiTrash2,
  FiClock,
  FiCheck,
} from "react-icons/fi";
import { TbQrcode } from "react-icons/tb";
import QRCode from "qrcode";
import { useAppPrefs } from "../../components/AppPrefsProvider";

/* assets + network codes (must match AdminAddress.network) */
const ASSETS = ["USDT", "BTC", "ETH", "SOL"];

const NETWORKS = {
  USDT: [
    { label: "TRON (TRC20)", code: "TRC20" },
    { label: "Ethereum (ERC20)", code: "ERC20" },
    { label: "BSC (BEP20)", code: "BEP20" },
  ],
  BTC: [{ label: "Bitcoin", code: "BITCOIN" }],
  ETH: [{ label: "Ethereum", code: "ETHEREUM" }],
  SOL: [{ label: "Solana", code: "SOLANA" }],
};

/* ---- i18n ---- */
const TXT = {
  en: {
    deposit: "Deposit",
    crypto: "Crypto",
    card: "Card",
    asset: "Asset",
    network: "Network",
    amount: "Amount",
    max: "Max",
    demoMax: "Demo max available:",
    depositAddress: "Deposit Address",
    copy: "Copy",
    loading: "Loading address…",
    noAddress: "No active deposit address set for",
    askAdmin: "Ask admin to add one.",
    sendOnly: "Send only",
    via: "via",
    uploadReceipt: "Upload Receipt",
    chooseFile: "Choose file",
    fileHint: "PNG, JPG or PDF. Max 10MB.",
    submit: "Submit Deposit",
    submitting: "Submitting…",
    pendingTitle: "Deposit submitted — Pending review",
    submitted: "Submitted",
    memoTag: "Memo / Tag",
    receiptFile: "Receipt file",
    done: "Done",
    receivedMsg:
      "Your receipt was received and is being reviewed. Funds will be credited once confirmed and approved.",
    copied: "Address copied!",
    copyFail: "Could not copy. Long-press to copy manually.",
    failedAddr: "Could not load deposit address",
    failedFetch: "Failed to fetch deposit address",
    maxFile: "Max file size is 10MB.",
    noAddrCanvas: "No address",
    memoRequired: "Memo/Tag required:",
    cardAmount: "Amount (USD)",
    payCard: "Pay with Card",
    cardNote: "Securely processed. Minimum $10.",
  },
  fr: {
    deposit: "Dépôt",
    crypto: "Crypto",
    card: "Carte",
    asset: "Actif",
    network: "Réseau",
    amount: "Montant",
    max: "Max",
    demoMax: "Max démo disponible :",
    depositAddress: "Adresse de dépôt",
    copy: "Copier",
    loading: "Chargement de l’adresse…",
    noAddress: "Aucune adresse de dépôt active pour",
    askAdmin: "Demandez à l’admin d’en ajouter une.",
    sendOnly: "Envoyez uniquement",
    via: "via",
    uploadReceipt: "Téléverser le reçu",
    chooseFile: "Choisir un fichier",
    fileHint: "PNG, JPG ou PDF. Max 10 Mo.",
    submit: "Envoyer le dépôt",
    submitting: "Envoi…",
    pendingTitle: "Dépôt envoyé — En attente de validation",
    submitted: "Envoyé",
    memoTag: "Mémo / Tag",
    receiptFile: "Fichier reçu",
    done: "Terminé",
    receivedMsg:
      "Votre reçu a été reçu et est en cours de vérification. Les fonds seront crédités après confirmation.",
    copied: "Adresse copiée !",
    copyFail: "Impossible de copier. Copiez manuellement.",
    failedAddr: "Impossible de charger l’adresse de dépôt",
    failedFetch: "Échec du chargement de l’adresse",
    maxFile: "Taille max : 10 Mo.",
    noAddrCanvas: "Aucune adresse",
    memoRequired: "Mémo/Tag requis :",
    cardAmount: "Montant (USD)",
    payCard: "Payer par carte",
    cardNote: "Paiement sécurisé. Minimum 10 $.",
  },
  es: {
    deposit: "Depósito",
    crypto: "Cripto",
    card: "Tarjeta",
    asset: "Activo",
    network: "Red",
    amount: "Monto",
    max: "Max",
    demoMax: "Máximo demo disponible:",
    depositAddress: "Dirección de depósito",
    copy: "Copiar",
    loading: "Cargando dirección…",
    noAddress: "No hay dirección activa para",
    askAdmin: "Pídele al admin que agregue una.",
    sendOnly: "Envía solo",
    via: "por",
    uploadReceipt: "Subir recibo",
    chooseFile: "Elegir archivo",
    fileHint: "PNG, JPG o PDF. Máx 10MB.",
    submit: "Enviar depósito",
    submitting: "Enviando…",
    pendingTitle: "Depósito enviado — Pendiente de revisión",
    submitted: "Enviado",
    memoTag: "Memo / Tag",
    receiptFile: "Archivo de recibo",
    done: "Listo",
    receivedMsg:
      "Tu recibo fue recibido y está en revisión. Los fondos se acreditarán cuando se confirme.",
    copied: "¡Dirección copiada!",
    copyFail: "No se pudo copiar. Copia manualmente.",
    failedAddr: "No se pudo cargar la dirección",
    failedFetch: "Error al obtener dirección",
    maxFile: "Tamaño máximo: 10MB.",
    noAddrCanvas: "Sin dirección",
    memoRequired: "Memo/Tag requerido:",
    cardAmount: "Monto (USD)",
    payCard: "Pagar con tarjeta",
    cardNote: "Procesado seguro. Mínimo $10.",
  },
  de: {
    deposit: "Einzahlung",
    crypto: "Krypto",
    card: "Karte",
    asset: "Asset",
    network: "Netzwerk",
    amount: "Betrag",
    max: "Max",
    demoMax: "Demo-Max verfügbar:",
    depositAddress: "Einzahlungsadresse",
    copy: "Kopieren",
    loading: "Adresse wird geladen…",
    noAddress: "Keine aktive Einzahlungsadresse für",
    askAdmin: "Admin soll eine hinzufügen.",
    sendOnly: "Sende nur",
    via: "über",
    uploadReceipt: "Beleg hochladen",
    chooseFile: "Datei wählen",
    fileHint: "PNG, JPG oder PDF. Max 10MB.",
    submit: "Einzahlung senden",
    submitting: "Sende…",
    pendingTitle: "Einzahlung gesendet — Prüfung ausstehend",
    submitted: "Gesendet",
    memoTag: "Memo / Tag",
    receiptFile: "Beleg-Datei",
    done: "Fertig",
    receivedMsg:
      "Dein Beleg wurde empfangen und wird geprüft. Gutschrift erfolgt nach Bestätigung.",
    copied: "Adresse kopiert!",
    copyFail: "Konnte nicht kopieren. Manuell kopieren.",
    failedAddr: "Adresse konnte nicht geladen werden",
    failedFetch: "Adresse konnte nicht abgerufen werden",
    maxFile: "Max. Dateigröße: 10MB.",
    noAddrCanvas: "Keine Adresse",
    memoRequired: "Memo/Tag erforderlich:",
    cardAmount: "Betrag (USD)",
    payCard: "Mit Karte zahlen",
    cardNote: "Sicher verarbeitet. Minimum $10.",
  },
  ar: {
    deposit: "إيداع",
    crypto: "كريبتو",
    card: "بطاقة",
    asset: "الأصل",
    network: "الشبكة",
    amount: "المبلغ",
    max: "الحد",
    demoMax: "الحد التجريبي المتاح:",
    depositAddress: "عنوان الإيداع",
    copy: "نسخ",
    loading: "جاري تحميل العنوان…",
    noAddress: "لا يوجد عنوان إيداع نشط لـ",
    askAdmin: "اطلب من المسؤول إضافة عنوان.",
    sendOnly: "أرسل فقط",
    via: "عبر",
    uploadReceipt: "رفع الإيصال",
    chooseFile: "اختر ملف",
    fileHint: "PNG, JPG أو PDF. الحد 10MB.",
    submit: "إرسال الإيداع",
    submitting: "جارٍ الإرسال…",
    pendingTitle: "تم إرسال الإيداع — قيد المراجعة",
    submitted: "تم الإرسال",
    memoTag: "مذكرة / وسم",
    receiptFile: "ملف الإيصال",
    done: "تم",
    receivedMsg:
      "تم استلام الإيصال وهو قيد المراجعة. سيتم إضافة الرصيد بعد التأكيد والموافقة.",
    copied: "تم نسخ العنوان!",
    copyFail: "تعذر النسخ. انسخ يدويًا.",
    failedAddr: "تعذر تحميل عنوان الإيداع",
    failedFetch: "فشل جلب عنوان الإيداع",
    maxFile: "الحد الأقصى 10MB.",
    noAddrCanvas: "لا يوجد عنوان",
    memoRequired: "المذكرة/الوسم مطلوب:",
    cardAmount: "المبلغ (USD)",
    payCard: "الدفع بالبطاقة",
    cardNote: "دفع آمن. الحد الأدنى 10$.",
  },
  zh: {
    deposit: "充值",
    crypto: "加密",
    card: "卡",
    asset: "资产",
    network: "网络",
    amount: "金额",
    max: "最大",
    demoMax: "演示最大可用：",
    depositAddress: "充值地址",
    copy: "复制",
    loading: "正在加载地址…",
    noAddress: "未设置可用充值地址：",
    askAdmin: "请联系管理员添加。",
    sendOnly: "仅发送",
    via: "通过",
    uploadReceipt: "上传凭证",
    chooseFile: "选择文件",
    fileHint: "PNG、JPG 或 PDF。最大 10MB。",
    submit: "提交充值",
    submitting: "提交中…",
    pendingTitle: "已提交充值 — 等待审核",
    submitted: "提交时间",
    memoTag: "备注 / 标签",
    receiptFile: "凭证文件",
    done: "完成",
    receivedMsg: "我们已收到凭证并正在审核。确认通过后将入账。",
    copied: "地址已复制！",
    copyFail: "复制失败，请手动复制。",
    failedAddr: "无法加载充值地址",
    failedFetch: "获取充值地址失败",
    maxFile: "最大文件 10MB。",
    noAddrCanvas: "无地址",
    memoRequired: "需要 Memo/Tag：",
    cardAmount: "金额 (USD)",
    payCard: "银行卡支付",
    cardNote: "安全处理。最低 $10。",
  },
};

function pickLang(code) {
  const k = String(code || "en").toLowerCase();
  return TXT[k] ? k : "en";
}

export default function DepositPage() {
  const router = useRouter();
  const { language, locale, formatMoney } = useAppPrefs();
  const L = TXT[pickLang(language)];

  const [tab, setTab] = useState("crypto");
  const [submitted, setSubmitted] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [asset, setAsset] = useState("USDT");
  const [networkCode, setNetworkCode] = useState(NETWORKS.USDT[0].code);
  const [amount, setAmount] = useState("");

  const [depositAddress, setDepositAddress] = useState("");
  const [depositMemo, setDepositMemo] = useState("");
  const [addrLoading, setAddrLoading] = useState(false);

  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState("");

  const canvasRef = useRef(null);

  const selectedNetwork = useMemo(() => {
    return (NETWORKS[asset] || []).find((n) => n.code === networkCode) || NETWORKS[asset]?.[0];
  }, [asset, networkCode]);

  // demo max balance per asset
  const DEMO_MAX = { USDT: 5000, BTC: 0.75, ETH: 12, SOL: 210 };

  // Fetch admin address whenever asset/network changes
  useEffect(() => {
    let live = true;

    async function loadAddr() {
      setAddrLoading(true);
      setError("");
      try {
        const qs = new URLSearchParams({ asset, network: networkCode }).toString();
        const r = await fetch(`/api/deposit-address?${qs}`, { cache: "no-store" });
        const j = await r.json().catch(() => ({}));
        if (!live) return;

        if (!r.ok || !j.ok) throw new Error(j.error || L.failedFetch);

        if (j.found && j.address?.address) {
          setDepositAddress(j.address.address);
          setDepositMemo(j.address.memo || "");
        } else {
          setDepositAddress("");
          setDepositMemo("");
        }
      } catch (e) {
        if (!live) return;
        setDepositAddress("");
        setDepositMemo("");
        setError(e?.message || L.failedAddr);
      } finally {
        if (live) setAddrLoading(false);
      }
    }

    loadAddr();
    return () => {
      live = false;
    };
  }, [asset, networkCode, L.failedAddr, L.failedFetch]);

  // Generate QR whenever address changes
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    if (!depositAddress) {
      const ctx = c.getContext("2d");
      c.width = 192;
      c.height = 192;
      ctx.clearRect(0, 0, 192, 192);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(0, 0, 192, 192);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "12px system-ui";
      ctx.fillText(L.noAddrCanvas, 56, 98);
      return;
    }

    QRCode.toCanvas(c, depositAddress, { width: 192, margin: 1 }).catch(() => {});
  }, [depositAddress, L.noAddrCanvas]);

  const handleCopy = async () => {
    if (!depositAddress) return;
    try {
      await navigator.clipboard.writeText(depositAddress);
      alert(L.copied);
    } catch {
      alert(L.copyFail);
    }
  };

  const handleMax = () => setAmount(String(DEMO_MAX[asset] ?? ""));

  const onPickReceipt = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      alert(L.maxFile);
      return;
    }
    setReceiptFile(f);
    setReceiptUrl(URL.createObjectURL(f));
  };

  const clearReceipt = () => {
    if (receiptUrl) URL.revokeObjectURL(receiptUrl);
    setReceiptFile(null);
    setReceiptUrl("");
  };

  const canSubmit = Number(amount) > 0 && !!receiptFile && !!depositAddress;

  const submitDeposit = async () => {
    const amt = Number(amount);
    if (!canSubmit || !(amt > 0)) return;

    setError("");
    setBusy(true);

    try {
      const fd = new FormData();
      fd.append("asset", asset);
      fd.append("network", networkCode);
      fd.append("amount", amount);
      fd.append("currency", "USD");
      fd.append("notes", depositMemo ? `Memo: ${depositMemo}` : "");
      if (receiptFile) fd.append("receipt", receiptFile);

      const res = await fetch("/api/tx/deposit", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Deposit failed");

      setReceipt({
        amount: amt,
        asset,
        network: selectedNetwork?.label || networkCode,
        address: depositAddress,
        memo: depositMemo || "",
        ts: Date.now(),
        fileName: receiptFile?.name,
        filePreview: receiptUrl,
      });

      setSubmitted(true);
      setAmount("");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleCardPay = () => router.push("/support/live-chat?topic=card-deposit");

  const done = () => {
    if (receipt?.filePreview) URL.revokeObjectURL(receipt.filePreview);
    setReceipt(null);
    setSubmitted(false);
    clearReceipt();
    router.push("/home");
  };

  return (
    <main className="min-h-[100dvh] bg-[#10141c]" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="sticky top-0 z-10 bg-[#10141c]/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-300 hover:text-white">
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-white text-lg font-bold">{L.deposit}</h1>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        {!submitted && (
          <div className="flex gap-2 bg-[#161b29] rounded-xl p-1">
            <button
              className={`flex-1 py-2 rounded-lg font-semibold ${
                tab === "crypto" ? "bg-blue-600 text-white" : "text-gray-300"
              }`}
              onClick={() => setTab("crypto")}
            >
              <span className="inline-flex items-center gap-2">
                <TbQrcode /> {L.crypto}
              </span>
            </button>
            <button
              className={`flex-1 py-2 rounded-lg font-semibold ${
                tab === "card" ? "bg-blue-600 text-white" : "text-gray-300"
              }`}
              onClick={() => setTab("card")}
            >
              <span className="inline-flex items-center gap-2">
                <FiCreditCard /> {L.card}
              </span>
            </button>
          </div>
        )}

        {submitted && receipt ? (
          <section className="space-y-5">
            <div className="bg-[#0f1424] border border-blue-900/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/15 text-yellow-300">
                  <FiClock />
                </span>
                <h2 className="text-white font-bold">{L.pendingTitle}</h2>
              </div>

              {receipt.filePreview && (
                <img
                  src={receipt.filePreview}
                  alt="receipt preview"
                  className="w-full max-h-60 object-contain rounded-lg border border-white/10 mb-4"
                />
              )}

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <div>
                  <dt className="text-gray-400">{L.amount}</dt>
                  <dd className="text-white font-semibold">
                    {formatNumber(receipt.amount, locale)}{" "}
                    <span className="text-gray-300">{receipt.asset}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-400">{L.submitted}</dt>
                  <dd className="text-white font-semibold">{formatDateTime(receipt.ts, locale)}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">{L.network}</dt>
                  <dd className="text-white font-semibold">{receipt.network}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-400">{L.depositAddress}</dt>
                  <dd className="text-white font-mono break-all">{receipt.address}</dd>
                </div>
                {receipt.memo ? (
                  <div className="sm:col-span-2">
                    <dt className="text-gray-400">{L.memoTag}</dt>
                    <dd className="text-white font-semibold">{receipt.memo}</dd>
                  </div>
                ) : null}
                {receipt.fileName && (
                  <div className="sm:col-span-2">
                    <dt className="text-gray-400">{L.receiptFile}</dt>
                    <dd className="text-white">{receipt.fileName}</dd>
                  </div>
                )}
              </dl>

              <p className="text-xs text-gray-400 mt-4">{L.receivedMsg}</p>

              <button
                onClick={done}
                className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 inline-flex items-center justify-center gap-2"
              >
                <FiCheck /> {L.done}
              </button>
            </div>
          </section>
        ) : tab === "crypto" ? (
          <section className="space-y-5">
            <Field label={L.asset}>
              <select
                value={asset}
                onChange={(e) => {
                  const a = e.target.value;
                  setAsset(a);
                  setNetworkCode(NETWORKS[a][0].code);
                }}
                className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
              >
                {ASSETS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>

            <Field label={L.network}>
              <select
                value={networkCode}
                onChange={(e) => setNetworkCode(e.target.value)}
                className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
              >
                {(NETWORKS[asset] || []).map((n) => (
                  <option key={n.code} value={n.code}>
                    {n.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={`${L.amount} (${asset})`}>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
                />
                <button
                  type="button"
                  onClick={handleMax}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {L.max}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {L.demoMax} {DEMO_MAX[asset] ?? 0} {asset}
              </p>
            </Field>

            <div className="bg-[#0f1424] border border-blue-900/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">{L.depositAddress}</h3>
                <button
                  className="text-blue-300 text-sm inline-flex items-center gap-1 disabled:opacity-50"
                  onClick={handleCopy}
                  disabled={!depositAddress}
                >
                  <FiCopy /> {L.copy}
                </button>
              </div>

              {addrLoading ? (
                <div className="text-sm text-gray-300">{L.loading}</div>
              ) : depositAddress ? (
                <>
                  <div className="w-full bg-black/30 border border-blue-900/20 rounded-lg px-3 py-2 text-gray-100 font-mono break-all">
                    {depositAddress}
                  </div>

                  {depositMemo ? (
                    <div className="text-xs text-yellow-200 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                      {L.memoRequired} <span className="font-semibold">{depositMemo}</span>
                    </div>
                  ) : null}

                  <div className="rounded-lg bg-black/30 grid place-items-center h-48">
                    <canvas ref={canvasRef} className="rounded-md" />
                  </div>
                </>
              ) : (
                <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {L.noAddress} {asset} ({networkCode}). {L.askAdmin}
                </div>
              )}

              <p className="text-xs text-gray-400">
                {L.sendOnly} <span className="text-white font-semibold">{asset}</span> {L.via}{" "}
                <span className="text-white font-semibold">{selectedNetwork?.label || networkCode}</span>.
              </p>
            </div>

            <div className="bg-[#0f1424] border border-blue-900/30 rounded-xl p-4 space-y-3">
              <div className="text-white font-semibold">{L.uploadReceipt}</div>

              <label className="block">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={onPickReceipt}
                  className="hidden"
                  id="receipt-input"
                />
                <div className="cursor-pointer border border-dashed border-blue-900/40 rounded-xl p-4 text-center hover:bg-white/5 transition">
                  <div className="inline-flex items-center gap-2 text-blue-300 font-semibold">
                    <FiUploadCloud /> {L.chooseFile}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{L.fileHint}</div>
                </div>
              </label>

              {receiptFile && (
                <div className="flex items-center gap-3">
                  {receiptFile.type.startsWith("image/") ? (
                    <img
                      src={receiptUrl}
                      alt="receipt preview"
                      className="h-24 w-24 object-cover rounded-lg border border-white/10"
                    />
                  ) : (
                    <div className="h-24 w-24 grid place-items-center rounded-lg border border-white/10 text-xs text-gray-300">
                      PDF
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{receiptFile.name}</p>
                    <p className="text-xs text-gray-400">
                      {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button onClick={clearReceipt} className="text-red-300 hover:text-red-200">
                    <FiTrash2 className="text-lg" />
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              disabled={!canSubmit || busy}
              onClick={submitDeposit}
              className={`w-full rounded-xl py-3 font-bold transition ${
                canSubmit && !busy ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-700 text-gray-300"
              }`}
            >
              {busy ? L.submitting : L.submit}
            </button>
          </section>
        ) : (
          <section className="space-y-5">
            <Field label={L.cardAmount}>
              <input
                type="number"
                min="10"
                placeholder="100"
                className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
              />
            </Field>
            <button
              onClick={handleCardPay}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 transition"
            >
              {L.payCard}
            </button>
            <p className="text-xs text-gray-400 text-center">{L.cardNote}</p>

            {/* Example: show currency formatting usage somewhere if you want */}
            <p className="text-[11px] text-gray-500 text-center">
              {formatMoney(10)} {/* shows min in selected currency */}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-gray-300 text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

function formatNumber(n, locale) {
  try {
    return Number(n).toLocaleString(locale || undefined, { maximumFractionDigits: 8 });
  } catch {
    return String(n);
  }
}

function formatDateTime(ts, locale) {
  const d = new Date(ts || Date.now());
  return d.toLocaleString(locale || undefined);
}
