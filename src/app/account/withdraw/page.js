"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiClock, FiCheck } from "react-icons/fi";
import { useWalletStore } from "../../../lib/walletStore";
import { useAppPrefs } from "../../components/AppPrefsProvider";

/* ---- config ---- */
const ASSETS = ["USDT", "BTC", "ETH", "SOL"];
const FEES = { USDT: 1.0, BTC: 0.0003, ETH: 0.003, SOL: 0.0005 }; // demo fees (asset units)
const MIN_USD = 1000;

/* map to CoinGecko ids */
const CG_IDS = { USDT: "tether", BTC: "bitcoin", ETH: "ethereum", SOL: "solana" };

const TXT = {
  en: {
    title: "Withdraw",
    balance: "Balance",
    withdrawable: "Withdrawable Balance",
    asset: "Asset",
    amountAsset: "Amount",
    amountUsd: "Amount (USD)",
    destination: "Destination Address",
    price: "Price",
    fee: "Network fee",
    receive: "You will receive",
    min: "Minimum withdrawal is",
    exceed: "Exceeds withdrawable balance.",
    submit: "Submit Withdrawal",
    pendingTitle: "Withdrawal submitted — Pending review",
    submitted: "Submitted",
    rate: "Rate",
    net: "Net to receive",
    done: "Done",
    hint:
      "Ensure the address matches the selected asset’s network. Transactions are irreversible.",
  },
  fr: {
    title: "Retrait",
    balance: "Solde",
    withdrawable: "Solde retirable",
    asset: "Actif",
    amountAsset: "Montant",
    amountUsd: "Montant (USD)",
    destination: "Adresse de destination",
    price: "Prix",
    fee: "Frais réseau",
    receive: "Vous recevrez",
    min: "Le retrait minimum est",
    exceed: "Dépasse le solde retirable.",
    submit: "Envoyer le retrait",
    pendingTitle: "Retrait envoyé — En attente de validation",
    submitted: "Envoyé",
    rate: "Taux",
    net: "Net à recevoir",
    done: "Terminé",
    hint:
      "Assurez-vous que l’adresse correspond au réseau de l’actif. Transactions irréversibles.",
  },
  es: {
    title: "Retirar",
    balance: "Balance",
    withdrawable: "Balance retirable",
    asset: "Activo",
    amountAsset: "Monto",
    amountUsd: "Monto (USD)",
    destination: "Dirección de destino",
    price: "Precio",
    fee: "Comisión de red",
    receive: "Recibirás",
    min: "El retiro mínimo es",
    exceed: "Supera el balance retirable.",
    submit: "Enviar retiro",
    pendingTitle: "Retiro enviado — Pendiente de revisión",
    submitted: "Enviado",
    rate: "Tasa",
    net: "Neto a recibir",
    done: "Listo",
    hint:
      "Asegúrate de que la dirección coincida con la red del activo. Irreversible.",
  },
  de: {
    title: "Auszahlung",
    balance: "Saldo",
    withdrawable: "Auszahlbarer Saldo",
    asset: "Asset",
    amountAsset: "Betrag",
    amountUsd: "Betrag (USD)",
    destination: "Zieladresse",
    price: "Preis",
    fee: "Netzwerkgebühr",
    receive: "Du erhältst",
    min: "Mindestbetrag ist",
    exceed: "Übersteigt auszahlbaren Saldo.",
    submit: "Auszahlung senden",
    pendingTitle: "Auszahlung gesendet — Prüfung ausstehend",
    submitted: "Gesendet",
    rate: "Kurs",
    net: "Netto erhalten",
    done: "Fertig",
    hint:
      "Adresse muss zum Netzwerk passen. Transaktionen sind irreversibel.",
  },
  ar: {
    title: "سحب",
    balance: "الرصيد",
    withdrawable: "الرصيد القابل للسحب",
    asset: "الأصل",
    amountAsset: "المبلغ",
    amountUsd: "المبلغ (USD)",
    destination: "عنوان الوجهة",
    price: "السعر",
    fee: "رسوم الشبكة",
    receive: "ستستلم",
    min: "الحد الأدنى للسحب هو",
    exceed: "يتجاوز الرصيد القابل للسحب.",
    submit: "إرسال السحب",
    pendingTitle: "تم إرسال السحب — قيد المراجعة",
    submitted: "تم الإرسال",
    rate: "السعر",
    net: "الصافي المستلم",
    done: "تم",
    hint:
      "تأكد أن العنوان يطابق شبكة الأصل. المعاملات غير قابلة للإرجاع.",
  },
  zh: {
    title: "提现",
    balance: "余额",
    withdrawable: "可提现余额",
    asset: "资产",
    amountAsset: "数量",
    amountUsd: "金额 (USD)",
    destination: "目标地址",
    price: "价格",
    fee: "网络手续费",
    receive: "你将收到",
    min: "最低提现为",
    exceed: "超过可提现余额。",
    submit: "提交提现",
    pendingTitle: "已提交提现 — 等待审核",
    submitted: "提交时间",
    rate: "汇率",
    net: "到账净额",
    done: "完成",
    hint:
      "确保地址匹配资产网络。交易不可撤销。",
  },
};

function pickLang(code) {
  const k = String(code || "en").toLowerCase();
  return TXT[k] ? k : "en";
}

export default function WithdrawPage() {
  const router = useRouter();
  const { language, locale, formatMoney } = useAppPrefs();
  const L = TXT[pickLang(language)];

  const totalFromStore = useWalletStore((s) => s.balances?.total || 0);
  const storeWithdrawable = useWalletStore((s) => s.withdrawableUsd ?? null);

  const [balanceUsd, setBalanceUsd] = useState(totalFromStore);
  const [withdrawableUsd, setWithdrawableUsd] = useState(storeWithdrawable ?? totalFromStore);

  useEffect(() => {
    setBalanceUsd(totalFromStore);
    if (storeWithdrawable != null) setWithdrawableUsd(storeWithdrawable);
  }, [totalFromStore, storeWithdrawable]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/account/summary", { cache: "no-store" });
        if (!r.ok) return;
        const j = await r.json();

        const total = Number(j.total ?? j.totalUsd ?? j.balance ?? 0) || 0;
        const wd = Number(j.withdrawable ?? j.withdrawableUsd ?? total) || 0;

        setBalanceUsd(total);
        setWithdrawableUsd(wd);
      } catch (err) {
        console.error("Failed to load account summary for withdraw page", err);
      }
    })();
  }, []);

  const [prices, setPrices] = useState({ USDT: 1, BTC: 65000, ETH: 3500, SOL: 200 });
  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const ids = Object.values(CG_IDS).join(",");
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
        const r = await fetch(url, { cache: "no-store" });
        if (!r.ok) return;
        const j = await r.json();
        const next = {
          USDT: j[CG_IDS.USDT]?.usd ?? 1,
          BTC: j[CG_IDS.BTC]?.usd ?? prices.BTC,
          ETH: j[CG_IDS.ETH]?.usd ?? prices.ETH,
          SOL: j[CG_IDS.SOL]?.usd ?? prices.SOL,
        };
        if (!canceled) setPrices(next);
      } catch {}
    })();
    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [asset, setAsset] = useState("USDT");
  const [address, setAddress] = useState("");
  const [amountAsset, setAmountAsset] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [lastEdited, setLastEdited] = useState("usd");

  const price = prices[asset];

  useEffect(() => {
    if (lastEdited === "usd") {
      const usd = Number(amountUsd || 0);
      if (price > 0) {
        const coin = usd / price;
        setAmountAsset(usd ? String(coin) : "");
      }
    } else {
      const coin = Number(amountAsset || 0);
      setAmountUsd(coin ? String(coin * price) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset, price]);

  const fee = FEES[asset];
  const netAsset = useMemo(() => {
    const a = Number(amountAsset || 0);
    return a > fee ? a - fee : 0;
  }, [amountAsset, fee]);

  const meetsMin = Number(amountUsd || 0) >= MIN_USD;
  const notOverWithdrawable = Number(amountUsd || 0) <= (withdrawableUsd || 0);
  const canSubmit =
    address.length > 8 && Number(amountAsset) > fee && meetsMin && notOverWithdrawable;

  const [submitted, setSubmitted] = useState(false);
  const [receipt, setReceipt] = useState(null);

  async function submitWithdrawal() {
    if (!canSubmit) return;

    const usd = Number(amountUsd);
    const coin = Number(amountAsset);

    try {
      const res = await fetch("/api/tx/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountUsd: usd,
          title: `Withdrawal — ${asset}`,
          asset,
          address,
          feeAsset: fee,
          netAsset,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Withdraw API error", err);
        alert(err.error || "Could not submit withdrawal");
        return;
      }

      const data = await res.json();
      const ref = data?.tx?.id;

      useWalletStore.setState((s) => ({
        tx: [
          {
            id: ref || `local_${Date.now()}`,
            type: "WITHDRAW",
            title: `Withdrawal — ${asset}`,
            amount: -usd,
            currency: "USD",
            status: "PENDING",
            ts: Date.now(),
          },
          ...(s.tx || []),
        ],
      }));

      setReceipt({
        asset,
        coinAmount: coin,
        usdAmount: usd,
        priceUsd: price,
        address,
        feeAsset: fee,
        netAsset,
        submittedAt: Date.now(),
        ref,
      });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      alert("Network error submitting withdrawal");
    }
  }

  const done = () => {
    setSubmitted(false);
    setReceipt(null);
    router.push("/home");
  };

  return (
    <main className="min-h-[100dvh] bg-[#10141c]" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="sticky top-0 z-10 bg-[#10141c]/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-300 hover:text-white">
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-white text-lg font-bold">{L.title}</h1>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        {!submitted && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Stat label={L.balance} value={formatMoney(balanceUsd)} />
            <Stat label={L.withdrawable} value={formatMoney(withdrawableUsd)} />
          </div>
        )}

        {submitted && receipt ? (
          <PendingReceipt receipt={receipt} onDone={done} L={L} locale={locale} formatMoney={formatMoney} />
        ) : (
          <>
            <Field label={L.asset}>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
              >
                {ASSETS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={`${L.amountAsset} (${asset})`}>
                <input
                  type="number"
                  value={amountAsset}
                  onChange={(e) => {
                    setLastEdited("asset");
                    setAmountAsset(e.target.value);
                    const v = Number(e.target.value || 0);
                    setAmountUsd(v ? String(v * price) : "");
                  }}
                  placeholder="0.00"
                  className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
                />
              </Field>

              <Field label={L.amountUsd}>
                <input
                  type="number"
                  value={amountUsd}
                  onChange={(e) => {
                    setLastEdited("usd");
                    setAmountUsd(e.target.value);
                    const v = Number(e.target.value || 0);
                    setAmountAsset(price ? String(v / price) : "");
                  }}
                  placeholder={String(MIN_USD)}
                  min={MIN_USD}
                  className={`w-full bg-[#0f1424] border rounded-lg px-3 py-2 text-white ${
                    Number(amountUsd || 0) >= MIN_USD ? "border-blue-900/30" : "border-red-500/40"
                  }`}
                />
              </Field>
            </div>

            <Field label={L.destination}>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Paste wallet address"
                className="w-full bg-[#0f1424] border border-blue-900/30 rounded-lg px-3 py-2 text-white"
              />
            </Field>

            <div className="bg-[#0f1424] border border-blue-900/30 rounded-xl p-4 text-sm">
              <Row k={L.price} v={`${formatMoney(price)} / ${asset}`} />
              <Row k={L.fee} v={`${FEES[asset]} ${asset}`} />
              <Row k={L.receive} v={`${netAsset.toFixed(6)} ${asset}`} strong />

              {!meetsMin && (
                <div className="mt-2 text-red-300 font-semibold">
                  {L.min} {formatMoney(MIN_USD)}.
                </div>
              )}
              {!notOverWithdrawable && (
                <div className="mt-2 text-red-300 font-semibold">{L.exceed}</div>
              )}
            </div>

            <button
              disabled={!canSubmit}
              className={`w-full rounded-xl py-3 font-bold transition ${
                canSubmit ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-700 text-gray-300"
              }`}
              onClick={submitWithdrawal}
            >
              {L.submit}
            </button>

            <p className="text-xs text-gray-400">{L.hint}</p>
          </>
        )}
      </div>
    </main>
  );
}

/* ---------- small components ---------- */

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-gray-300 text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-[#0f1424] border border-blue-900/30 rounded-xl p-4">
      <div className="text-gray-400 text-xs font-semibold uppercase">{label}</div>
      <div className="text-white text-lg font-extrabold">{value}</div>
    </div>
  );
}

function Row({ k, v, strong }) {
  return (
    <div className="flex justify-between text-gray-300 mt-1">
      <span>{k}</span>
      <span className={strong ? "text-white font-bold" : "text-gray-100 font-semibold"}>{v}</span>
    </div>
  );
}

function PendingReceipt({ receipt, onDone, L, locale, formatMoney }) {
  const { asset, coinAmount, usdAmount, priceUsd, address, feeAsset, netAsset, submittedAt } =
    receipt || {};

  return (
    <section className="space-y-5">
      <div className="bg-[#0f1424] border border-blue-900/30 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/15 text-yellow-300">
            <FiClock />
          </span>
          <h2 className="text-white font-bold">{L.pendingTitle}</h2>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <div>
            <dt className="text-gray-400">{L.amountAsset}</dt>
            <dd className="text-white font-semibold">
              {formatMoney(usdAmount)}{" "}
              <span className="text-gray-300">
                ({coinAmount?.toFixed?.(6)} {asset})
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-gray-400">{L.submitted}</dt>
            <dd className="text-white font-semibold">
              {new Date(submittedAt).toLocaleString(locale || undefined)}
            </dd>
          </div>
          <div>
            <dt className="text-gray-400">{L.rate}</dt>
            <dd className="text-white font-semibold">
              {formatMoney(priceUsd)} / {asset}
            </dd>
          </div>
          <div>
            <dt className="text-gray-400">{L.fee}</dt>
            <dd className="text-white font-semibold">
              {feeAsset} {asset}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-gray-400">{L.net}</dt>
            <dd className="text-white font-semibold">
              {netAsset?.toFixed?.(6)} {asset}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-gray-400">{L.destination}</dt>
            <dd className="text-white font-mono break-all">{address}</dd>
          </div>
        </dl>

        <button
          onClick={onDone}
          className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 inline-flex items-center justify-center gap-2"
        >
          <FiCheck /> {L.done}
        </button>
      </div>
    </section>
  );
}
