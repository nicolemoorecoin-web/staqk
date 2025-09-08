'use client';
import { useMemo, useState } from 'react';

/** ─────────────────────────────────────────────────────────────
 *  REAL (ACTUALS) — EDIT THIS ARRAY WITH YOUR TRUE WEEKLY NUMBERS
 *  The UI is unchanged; only these seed values are larger.
 *  Fields are for THIS week only.
 *  ───────────────────────────────────────────────────────────── */
const WEEK = {
  label: 'Week of Aug 18–24, 2025',
  baseCurrency: 'USD',
};

// Big sample data to produce multi-million weekly totals (replace with real)
const CLIENTS = [
  { client:'Atlas Capital',        sleeve:'Balanced',     startingBalanceUSD: 5_000_000,  depositsUSD: 0,       withdrawalsUSD: 0,        grossPnLUSD: 220_000, feesUSD: 4_000,  maxDDPct: 0.9, trades: 610, redDays: 1 },
  { client:'Borealis Partners',    sleeve:'Aggressive',   startingBalanceUSD: 8_500_000,  depositsUSD: 0,       withdrawalsUSD: 120_000,  grossPnLUSD: 620_000, feesUSD: 9_300,  maxDDPct: 1.9, trades: 960, redDays: 2 },
  { client:'Cedar Family Office',  sleeve:'Conservative', startingBalanceUSD: 3_200_000,  depositsUSD: 50_000,  withdrawalsUSD: 0,        grossPnLUSD: 64_000,  feesUSD: 1_100,  maxDDPct: 0.5, trades: 330, redDays: 0 },
  { client:'Delta Holdings',       sleeve:'Balanced',     startingBalanceUSD: 6_800_000,  depositsUSD: 0,       withdrawalsUSD: 0,        grossPnLUSD: 306_000, feesUSD: 5_300,  maxDDPct: 1.1, trades: 740, redDays: 1 },
  { client:'Epsilon Growth',       sleeve:'Aggressive',   startingBalanceUSD:10_200_000,  depositsUSD: 250_000, withdrawalsUSD: 0,        grossPnLUSD: 780_000, feesUSD: 12_800, maxDDPct: 2.3, trades: 1_120,redDays: 2 },
  { client:'Fjord Advisors',       sleeve:'Balanced',     startingBalanceUSD: 4_400_000,  depositsUSD: 0,       withdrawalsUSD: 0,        grossPnLUSD: 198_000, feesUSD: 3_100,  maxDDPct: 0.8, trades: 520, redDays: 1 },
  { client:'Garnet Holdings',      sleeve:'Aggressive',   startingBalanceUSD: 7_600_000,  depositsUSD: 0,       withdrawalsUSD: 85_000,   grossPnLUSD: 532_000, feesUSD: 8_700,  maxDDPct: 2.0, trades: 890, redDays: 2 },
  { client:'Harbor Trust',         sleeve:'Conservative', startingBalanceUSD: 2_900_000,  depositsUSD: 0,       withdrawalsUSD: 0,        grossPnLUSD: 58_000,  feesUSD: 900,    maxDDPct: 0.4, trades: 300, redDays: 0 },
  { client:'Ion Capital',          sleeve:'Balanced',     startingBalanceUSD: 3_700_000,  depositsUSD: 0,       withdrawalsUSD: 0,        grossPnLUSD: 166_000, feesUSD: 2_600,  maxDDPct: 0.9, trades: 480, redDays: 1 },
  { client:'Kepler Macro',         sleeve:'Aggressive',   startingBalanceUSD: 9_100_000,  depositsUSD: 0,       withdrawalsUSD: 150_000,  grossPnLUSD: 655_000, feesUSD: 10_900, maxDDPct: 2.1, trades: 1_010,redDays: 2 },
  { client:'Lumen Ventures',       sleeve:'Balanced',     startingBalanceUSD: 5_300_000,  depositsUSD: 0,       withdrawalsUSD: 0,        grossPnLUSD: 233_000, feesUSD: 3_700,  maxDDPct: 1.0, trades: 560, redDays: 1 },
  { client:'Monarch Fund',         sleeve:'Aggressive',   startingBalanceUSD:11_400_000,  depositsUSD: 0,       withdrawalsUSD: 200_000,  grossPnLUSD: 846_000, feesUSD: 13_900, maxDDPct: 2.5, trades: 1_180,redDays: 3 },
];

/** ─────────────────────────────────────────────────────────────
 *  SCENARIO (Illustrative) — same UI, bigger defaults
 *  Lets you model scale; clearly labeled in the UI as Scenario.
 *  ───────────────────────────────────────────────────────────── */
const SCENARIO_DEFAULT = {
  clientsCount: 60,
  avgStartAUM: 650_000,
  avgWeeklyReturnPct: 4.5,
  feeRatePctOfPnL: 1.5,
  depositsUSD: 300_000,
  withdrawalsUSD: 180_000,
};

/** ─────────────────────────────────────────────────────────────
 *  HELPERS (unchanged)
 *  ───────────────────────────────────────────────────────────── */
const fmtBig   = (n)=>n.toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0});
const fmtSmall = (n)=>n.toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:2});
const fmtPct   = (n)=>`${Number(n).toFixed(1)}%`;
const fmtCompact = (n)=>new Intl.NumberFormat(undefined,{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:1}).format(n);

function enrichRows(rows){
  return rows.map(r=>{
    const net    = (r.grossPnLUSD || 0) - (r.feesUSD || 0);
    const ending = (r.startingBalanceUSD || 0) + (r.depositsUSD || 0) - (r.withdrawalsUSD || 0) + net;
    return { ...r, netPnLUSD: net, endingBalanceUSD: ending };
  });
}
function totals(rows){
  const t = rows.reduce((a,r)=>{
    a.starting    += r.startingBalanceUSD || 0;
    a.deposits    += r.depositsUSD || 0;
    a.withdrawals += r.withdrawalsUSD || 0;
    a.gross       += r.grossPnLUSD || 0;
    a.fees        += r.feesUSD || 0;
    a.net         += (r.grossPnLUSD||0) - (r.feesUSD||0);
    a.ending      += ((r.startingBalanceUSD||0)+(r.depositsUSD||0)-(r.withdrawalsUSD||0)+((r.grossPnLUSD||0)-(r.feesUSD||0)));
    a.trades      += r.trades || 0;
    a.redDays     += r.redDays || 0;
    a.worstDD      = Math.max(a.worstDD, r.maxDDPct || 0);
    a.avgDDsum    += (r.maxDDPct || 0);
    a.count++;
    return a;
  },{starting:0,deposits:0,withdrawals:0,gross:0,fees:0,net:0,ending:0,trades:0,redDays:0,worstDD:0,avgDDsum:0,count:0});
  const avgDD = t.count ? t.avgDDsum/t.count : 0;
  return { ...t, avgDD };
}
function toCSV(rows){
  const header='client,sleeve,startingBalanceUSD,depositsUSD,withdrawalsUSD,grossPnLUSD,feesUSD,netPnLUSD,endingBalanceUSD,maxDDPct,trades,redDays';
  const lines=rows.map(r=>[
    r.client,r.sleeve,r.startingBalanceUSD,r.depositsUSD,r.withdrawalsUSD,r.grossPnLUSD,r.feesUSD,r.netPnLUSD,r.endingBalanceUSD,r.maxDDPct,r.trades,r.redDays
  ].join(','));
  return [header,...lines].join('\n');
}

/** ─────────────────────────────────────────────────────────────
 *  COMPONENT (UI unchanged)
 *  ───────────────────────────────────────────────────────────── */
export default function AdminClient(){
  const [obfuscate, setObfuscate] = useState(false);
  const [showCents, setShowCents] = useState(false);
  const [scenario, setScenario]   = useState(SCENARIO_DEFAULT);

  const data = useMemo(()=>enrichRows(CLIENTS),[]);
  const sum  = useMemo(()=>totals(data),[data]);

  const scen = useMemo(()=>{
    const starting = scenario.clientsCount * scenario.avgStartAUM;
    const gross    = starting * (scenario.avgWeeklyReturnPct/100);
    const fees     = gross * (scenario.feeRatePctOfPnL/100);
    const net      = gross - fees;
    const ending   = starting + scenario.depositsUSD - scenario.withdrawalsUSD + net;
    return { starting, gross, fees, net, ending };
  },[scenario]);

  const bigFmt = showCents ? fmtSmall : fmtBig;

  const downloadCSV=()=>{
    const blob=new Blob([toCSV(data)],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='admin_weekly_statement.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };
  const printPDF=()=>window.print();

  return (
    <main className="wrap">
      <header className="hdr">
        <div>
          <h1>Admin Statement</h1>
          <div className="muted">{WEEK.label} · Base: {WEEK.baseCurrency}</div>
        </div>
        <div className="actions">
          <label className="tog"><input type="checkbox" checked={obfuscate} onChange={e=>setObfuscate(e.target.checked)}/><span>Obfuscate client names</span></label>
          <label className="tog"><input type="checkbox" checked={showCents} onChange={e=>setShowCents(e.target.checked)}/><span>Show cents</span></label>
          <button onClick={downloadCSV}>Download CSV</button>
          <button onClick={printPDF}>Print / Save PDF</button>
        </div>
      </header>

      {/* REAL TOTALS (UI unchanged — numbers now larger from CLIENTS[]) */}
      <section className="hero">
        <div className="heroCard">
          <div className="heroLabel">Total Weekly Net P&amp;L (Real)</div>
          <div className="heroValue">{fmtCompact(sum.net)} <span className="fine">({bigFmt(sum.net)})</span></div>
          <div className="heroSub">Gross {bigFmt(sum.gross)} · Fees {bigFmt(sum.fees)}</div>
        </div>
        <div className="heroSide">
          <div className="mini"><div className="miniLabel">Starting AUM</div><div className="miniValue">{bigFmt(sum.starting)}</div></div>
          <div className="mini"><div className="miniLabel">Deposits</div><div className="miniValue pos">{bigFmt(sum.deposits)}</div></div>
          <div className="mini"><div className="miniLabel">Withdrawals</div><div className="miniValue neg">{bigFmt(sum.withdrawals)}</div></div>
          <div className="mini"><div className="miniLabel">Ending AUM</div><div className="miniValue">{bigFmt(sum.ending)}</div></div>
          <div className="mini"><div className="miniLabel">Trades (total)</div><div className="miniValue">{sum.trades.toLocaleString()}</div></div>
          <div className="mini"><div className="miniLabel">Max DD (worst)</div><div className="miniValue">{sum.worstDD.toFixed(1)}%</div></div>
        </div>
      </section>

      {/* SCENARIO (Illustrative) — unchanged UI, bigger defaults */}
      <section className="scenario card">
        <div className="scnHead">
          <h2>Scenario (Illustrative)</h2>
          <span className="pill">Modeling at scale — not actuals</span>
        </div>
        <div className="scnGrid">
          <label>Clients
            <input type="number" min={1} step={1} value={scenario.clientsCount} onChange={e=>setScenario(s=>({...s, clientsCount:Number(e.target.value||0)}))}/>
          </label>
          <label>Avg Start AUM (USD)
            <input type="number" min={0} step={10000} value={scenario.avgStartAUM} onChange={e=>setScenario(s=>({...s, avgStartAUM:Number(e.target.value||0)}))}/>
          </label>
          <label>Avg Weekly Return (% gross)
            <input type="number" min={0} step={0.1} value={scenario.avgWeeklyReturnPct} onChange={e=>setScenario(s=>({...s, avgWeeklyReturnPct:Number(e.target.value||0)}))}/>
          </label>
          <label>Fee Rate (% of gross P&amp;L)
            <input type="number" min={0} step={0.1} value={scenario.feeRatePctOfPnL} onChange={e=>setScenario(s=>({...s, feeRatePctOfPnL:Number(e.target.value||0)}))}/>
          </label>
          <label>Deposits (USD)
            <input type="number" min={0} step={10000} value={scenario.depositsUSD} onChange={e=>setScenario(s=>({...s, depositsUSD:Number(e.target.value||0)}))}/>
          </label>
          <label>Withdrawals (USD)
            <input type="number" min={0} step={10000} value={scenario.withdrawalsUSD} onChange={e=>setScenario(s=>({...s, withdrawalsUSD:Number(e.target.value||0)}))}/>
          </label>
        </div>

        <div className="scnTotals">
          <div className="heroCard alt">
            <div className="heroLabel">Scenario Weekly Net P&amp;L</div>
            <div className="heroValue">{fmtCompact(scen.net)} <span className="fine">({bigFmt(scen.net)})</span></div>
            <div className="heroSub">Gross {bigFmt(scen.gross)} · Fees {bigFmt(scen.fees)}</div>
          </div>
          <div className="miniRow">
            <div className="mini"><div className="miniLabel">Scenario Starting AUM</div><div className="miniValue">{bigFmt(scen.starting)}</div></div>
            <div className="mini"><div className="miniLabel">Scenario Ending AUM</div><div className="miniValue">{bigFmt(scen.ending)}</div></div>
          </div>
          <p className="note">Scenario is illustrative only to visualize scale. Keep the “Real” section above for actual client totals.</p>
        </div>
      </section>

      {/* PER-CLIENT TABLE (unchanged) */}
      <section className="tableWrap">
        <table className="table">
          <thead>
            <tr>
              <th>Client</th><th>Sleeve</th><th>Start</th><th>Deposits</th><th>Withdrawals</th>
              <th>Gross</th><th>Fees</th><th>Net</th><th>Ending</th><th>Max DD</th><th>Trades</th><th>Red Days</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r,i)=>(
              <tr key={i}>
                <td>{obfuscate?`Client ${i+1}`:r.client}</td>
                <td>{r.sleeve}</td>
                <td>{showCents?fmtSmall(r.startingBalanceUSD):fmtBig(r.startingBalanceUSD)}</td>
                <td className="pos">{showCents?fmtSmall(r.depositsUSD):fmtBig(r.depositsUSD)}</td>
                <td className="neg">{showCents?fmtSmall(r.withdrawalsUSD):fmtBig(r.withdrawalsUSD)}</td>
                <td className={r.grossPnLUSD>=0?'pos':'neg'}>{showCents?fmtSmall(r.grossPnLUSD):fmtBig(r.grossPnLUSD)}</td>
                <td className="neg">{showCents?fmtSmall(r.feesUSD):fmtBig(r.feesUSD)}</td>
                <td className={r.netPnLUSD>=0?'pos':'neg'}>{showCents?fmtSmall(r.netPnLUSD):fmtBig(r.netPnLUSD)}</td>
                <td>{showCents?fmtSmall(r.endingBalanceUSD):fmtBig(r.endingBalanceUSD)}</td>
                <td>{fmtPct(r.maxDDPct)}</td>
                <td>{r.trades.toLocaleString()}</td>
                <td>{r.redDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="foot">
        <div>Prepared by: <b>Staqk Trading</b></div>
        <div>Generated: <b>{new Date().toUTCString()}</b></div>
        <div className="muted small">Real section shows actuals. Scenario section is illustrative.</div>
      </footer>

      <style jsx>{`
        :global(html, body){ background:#0b0f16; color:#e8eef7; }
        .wrap{ max-width:1200px; margin:32px auto 80px; padding:0 20px; font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; }
        .hdr{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; }
        h1{ margin:0 0 4px; font-size:28px; letter-spacing:.2px; }
        .muted{ opacity:.8; }
        .actions{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        button{ background:#122033; border:1px solid #244163; color:#e8eef7; padding:8px 12px; border-radius:10px; cursor:pointer; }
        button:hover{ filter:brightness(1.1); }
        .tog{ display:flex; align-items:center; gap:6px; background:#0f1724; border:1px solid #223043; padding:6px 10px; border-radius:10px; font-size:13px; }

        .hero{ display:grid; grid-template-columns:1.3fr .9fr; gap:14px; margin:10px 0 16px; }
        .heroCard{ background:#0e1420; border:1px solid #213247; border-radius:18px; padding:18px; text-align:center; }
        .heroLabel{ font-size:14px; opacity:.85; margin-bottom:8px; letter-spacing:.08em; text-transform:uppercase; }
        .heroValue{ font-size:54px; font-weight:900; letter-spacing:.5px; line-height:1.05; }
        .heroValue .fine{ font-size:16px; opacity:.8; margin-left:8px; }
        .heroSub{ margin-top:6px; opacity:.85; }
        .heroSide{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        .mini{ background:#0e1420; border:1px solid #213247; border-radius:18px; padding:12px; text-align:center; }
        .miniLabel{ font-size:12px; opacity:.8; margin-bottom:4px; }
        .miniValue{ font-size:18px; font-weight:800; }
        .pos{ color:#86efac; } .neg{ color:#fca5a5; }

        .card{ background:#0e1420; border:1px solid #213247; border-radius:18px; padding:16px; margin-bottom:16px; }
        .scenario .scnHead{ display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
        .pill{ font-size:12px; padding:4px 8px; border-radius:999px; background:#1a2334; border:1px solid #2a3b5a; }
        .scnGrid{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        .scnGrid label{ display:flex; flex-direction:column; gap:6px; font-size:13px; }
        .scnGrid input{ background:#0f1724; border:1px solid #223043; color:#e8eef7; padding:8px 10px; border-radius:10px; }
        .scnTotals{ margin-top:12px; }
        .scnTotals .alt{ text-align:center; }
        .miniRow{ display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:12px; }
        .note{ margin-top:8px; font-size:12px; opacity:.85; }

        .tableWrap{ border:1px solid #213247; border-radius:16px; overflow:auto; }
        table{ width:100%; border-collapse:collapse; font-size:13px; }
        thead th{ text-align:left; background:#0c1624; padding:10px; white-space:nowrap; border-bottom:1px solid #213247; position:sticky; top:0; }
        tbody td{ padding:10px; border-bottom:1px solid #172034; white-space:nowrap; }
        tbody tr:last-child td{ border-bottom:none; }

        .foot{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin-top:12px; font-size:12px; opacity:.85; }

        @media print{
          :global(html, body){ background:white; color:black; }
          .wrap{ max-width:none; margin:0; padding:0; }
          .hdr .actions{ display:none; }
          .heroCard, .mini, .tableWrap, .foot, .card{ border-color:#ccc; background:white; color:black; }
          thead th{ background:#f1f5f9 !important; border-bottom:1px solid #ddd; }
          tbody td{ border-bottom:1px solid #eee; }
          button{ display:none; }
        }

        @media (max-width:1100px){
          .hero{ grid-template-columns:1fr; }
          .heroSide{ grid-template-columns:1fr 1fr; }
          .scnGrid{ grid-template-columns:1fr 1fr; }
          .miniRow{ grid-template-columns:1fr; }
        }
      `}</style>
    </main>
  );
}
