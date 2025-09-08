'use client';
import { useMemo, useState } from 'react';

/** ──────────────────────────────────────────────────────────────────────────
 *  EDIT THESE NUMBERS ONLY
 *  Fill in your real weekend results + withdrawal timestamps.
 *  Everything else will render automatically.
 *  ────────────────────────────────────────────────────────────────────────── */
const WEEKENDS = {
  last: {
    rangeLabel: 'Fri–Sun (Last Weekend)',
    netUSD: 32800,            // X: last weekend net profit in USD
    allocUSD: 100000,         // X: allocation used
    maxDDPct: 1.2,            // X: max drawdown %
    fills: 287,               // X: number of fills/executions
    withdrawal: {
      amountUSD: 15000,       // X: withdrawn amount
      sentAt: '2025-08-10 16:12 UTC', // X
      landedAt: '2025-08-10 16:41 UTC' // X
    }
  },
  this: {
    rangeLabel: 'Fri–Sun (This Weekend)',
    netUSD: 41250,            // X: this weekend net profit in USD
    allocUSD: 112000,         // X
    maxDDPct: 1.0,            // X
    fills: 354,               // X
    withdrawal: {
      amountUSD: 20000,       // X
      sentAt: '2025-08-17 14:03 UTC', // X
      landedAt: '2025-08-17 14:29 UTC' // X
    }
  },
  whyElevated: [
    'Weekend liquidity thins → spreads widen across venues.',
    'Cross-exchange price gaps opened in BTC/ETH; hedged rotation captured those windows.',
    'Sizing stayed inside risk caps; no lockups and you keep custody (trade-only API).'
  ]
};

/** (Optional) keep your old demo data below if you still want the chart & tables */
const equity = [100, 100.6, 101.2, 101.0, 101.7, 102.4, 102.9];
const btcRef = [100, 100.8, 99.7, 100.3, 99.9, 101.5, 101.2];

const KPIS = [
  { label: 'Net Weekly Return', value: '+3.1%' },
  { label: 'Max Drawdown', value: '0.7%' },
  { label: 'Win Rate', value: '72%' },
  { label: 'Trades Executed', value: '118' },
  { label: 'Red Days', value: '2' },
  { label: 'Fees (% of P&L)', value: '0.21%' },
];

const LADDERS = [
  {
    name: 'Conservative',
    tag: 'Capital preservation',
    dailyPct: [0.002, 0.004],
    weeklyPct: [0.01, 0.02],
    riskCap: '≤ 0.5% daily',
    ddGuard: '≤ 2% max DD',
    notes: 'Highest hedge ratio, smallest position sizes.',
    accent: '#86efac',
  },
  {
    name: 'Balanced',
    tag: 'Default sleeve',
    dailyPct: [0.004, 0.008],
    weeklyPct: [0.02, 0.04],
    riskCap: '≤ 0.8% daily',
    ddGuard: '≤ 4% max DD',
    notes: 'Dynamic hedges, rotation on momentum & spreads.',
    accent: '#93c5fd',
    recommended: true,
  },
  {
    name: 'Aggressive',
    tag: 'Higher volatility',
    dailyPct: [0.008, 0.015],
    weeklyPct: [0.04, 0.07],
    riskCap: '≤ 1.2% daily',
    ddGuard: '≤ 8% max DD',
    notes: 'Tighter stops, more frequent rotations.',
    accent: '#fbbf24',
  },
];

const TRADES = [
  { t: '2025-08-12 14:03 UTC', venue: 'Coinbase', pair: 'BTC-USD', side: 'BUY',  qty: '0.62', entry: '58,940.10', exit: '59,072.40', fees: '6.12',  pnl: '+82.68' },
  { t: '2025-08-12 14:07 UTC', venue: 'Kraken',   pair: 'ETH-USD', side: 'SELL', qty: '4.10', entry: '2,642.20',  exit: '2,634.10',  fees: '4.21',  pnl: '-33.51' },
  { t: '2025-08-12 15:21 UTC', venue: 'Binance',  pair: 'BTC-USD', side: 'SELL', qty: '0.40', entry: '59,130.00', exit: '58,970.50', fees: '4.00',  pnl: '-67.80' },
  { t: '2025-08-13 09:12 UTC', venue: 'Kraken',   pair: 'ETH-USD', side: 'BUY',  qty: '5.20', entry: '2,628.40',  exit: '2,655.10',  fees: '5.02',  pnl: '+138.72' },
];

function pathFromSeries(series, w, h, pad = 8) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const stepX = (w - pad * 2) / Math.max(series.length - 1, 1);
  const norm = v => (max === min ? 0.5 : (v - min) / (max - min));
  return series.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - norm(v)) * (h - pad * 2);
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
}

const fmt$ = (n) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const fmtPct = (n) => `${Number(n).toFixed(1)}%`;

export default function SnapshotClient() {
  const [capital, setCapital] = useState(100000);

  const W = 760, H = 180;
  const eqPath  = pathFromSeries(equity, W, H);
  const btcPath = pathFromSeries(btcRef, W, H);

  const ladderWithDollars = useMemo(() => {
    return LADDERS.map(t => {
      const wkMin$ = capital * t.weeklyPct[0];
      const wkMax$ = capital * t.weeklyPct[1];
      const dyMin$ = capital * t.dailyPct[0];
      const dyMax$ = capital * t.dailyPct[1];
      return { ...t, wkMin$, wkMax$, dyMin$, dyMax$ };
    });
  }, [capital]);

  return (
    <main className="wrap">
      <header className="header">
        <div className="title">
          <h1>Weekly Snapshot</h1>
          <p>Strategy: <strong>Dynamic Hedged Arbitrage Rotation</strong></p>
        </div>
        <div className="badgeRow">
          <span className="badge green">Non-Custodial</span>
          <span className="badge blue">Trade-Only API</span>
          <span className="badge gray">Withdrawals Disabled</span>
          {/* Weekend highlight chips (auto from WEEKENDS) */}
          <span className="badge highlight">Last Wk Net: <b>{fmt$(WEEKENDS.last.netUSD)}</b></span>
          <span className="badge highlight">This Wk Net: <b>{fmt$(WEEKENDS.this.netUSD)}</b></span>
        </div>
      </header>

      <section className="kpis">
        {KPIS.map(k => (
          <div className="kpi" key={k.label}>
            <div className="kLabel">{k.label}</div>
            <div className="kValue">{k.value}</div>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="cardHead">
          <h2>Equity vs. BTC (7-Day)</h2>
          <span className="legend">Equity normalized to 100 for comparison.</span>
        </div>

        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Equity vs BTC">
          <rect x="0" y="0" width={W} height={H} rx="10" className="chartBg" />
          {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
            <line key={i} x1="12" x2={W-12} y1={12+g*(H-24)} y2={12+g*(H-24)} className="grid" />
          ))}
          <path d={btcPath} className="btcPath" fill="none" />
          <path d={eqPath}  className="eqPath"  fill="none" />
        </svg>
      </section>

      {/* ───────────────── Weekend Highlights ───────────────── */}
      <section className="card">
        <div className="cardHead">
          <h2>Weekend Highlights</h2>
          <span className="legend">Verifiable numbers + withdrawal timestamps</span>
        </div>

        <div className="weekends">
          {/* Last weekend */}
          <div className="wkCard">
            <div className="wkTitle">{WEEKENDS.last.rangeLabel}</div>
            <div className="grid2">
              <div className="row"><span>Net P&L</span><b>{fmt$(WEEKENDS.last.netUSD)}</b></div>
              <div className="row"><span>Allocation</span><b>{fmt$(WEEKENDS.last.allocUSD)}</b></div>
              <div className="row"><span>Max Drawdown</span><b>{fmtPct(WEEKENDS.last.maxDDPct)}</b></div>
              <div className="row"><span>Fills</span><b>{WEEKENDS.last.fills}</b></div>
            </div>
            <div className="subhead">Withdrawal</div>
            <div className="row"><span>Amount</span><b>{fmt$(WEEKENDS.last.withdrawal.amountUSD)}</b></div>
            <div className="row"><span>Sent</span><b>{WEEKENDS.last.withdrawal.sentAt}</b></div>
            <div className="row"><span>Landed</span><b>{WEEKENDS.last.withdrawal.landedAt}</b></div>
          </div>

          {/* This weekend */}
          <div className="wkCard">
            <div className="wkTitle">{WEEKENDS.this.rangeLabel}</div>
            <div className="grid2">
              <div className="row"><span>Net P&L</span><b>{fmt$(WEEKENDS.this.netUSD)}</b></div>
              <div className="row"><span>Allocation</span><b>{fmt$(WEEKENDS.this.allocUSD)}</b></div>
              <div className="row"><span>Max Drawdown</span><b>{fmtPct(WEEKENDS.this.maxDDPct)}</b></div>
              <div className="row"><span>Fills</span><b>{WEEKENDS.this.fills}</b></div>
            </div>
            <div className="subhead">Withdrawal</div>
            <div className="row"><span>Amount</span><b>{fmt$(WEEKENDS.this.withdrawal.amountUSD)}</b></div>
            <div className="row"><span>Sent</span><b>{WEEKENDS.this.withdrawal.sentAt}</b></div>
            <div className="row"><span>Landed</span><b>{WEEKENDS.this.withdrawal.landedAt}</b></div>
          </div>
        </div>

        <div className="why">
          <div className="subhead">Why elevated</div>
          <ul>
            {WEEKENDS.whyElevated.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>

        <p className="note">Targets/guardrails are enforced; numbers shown are illustrative until replaced with your live data and receipts.</p>
      </section>

      {/* ───────────────── Risk Ladder (kept) ───────────────── */}
      <section className="card">
        <div className="cardHead">
          <h2>Risk Ladder</h2>
          <span className="legend">Choose exposure by sleeve—returns scale with guardrails.</span>
        </div>
        <div className="ladder">
          {ladderWithDollars.map((t) => (
            <div className={`tier ${t.recommended ? 'rec' : ''}`} key={t.name} style={{ outlineColor: t.accent }}>
              <div className="tierHead">
                <div className="tierName" style={{ color: t.accent }}>{t.name}</div>
                <div className="tierTag">{t.tag}</div>
              </div>
              <div className="row"><span>Target (weekly)</span><b>
                {(t.weeklyPct[0]*100).toFixed(1)}–{(t.weeklyPct[1]*100).toFixed(1)}%
              </b></div>
              <div className="row"><span>Projected weekly @ {fmt$(capital)}</span><b>
                {fmt$(t.wkMin$)} – {fmt$(t.wkMax$)}
              </b></div>
              <div className="row"><span>Target (daily)</span><b>
                {(t.dailyPct[0]*100).toFixed(2)}–{(t.dailyPct[1]*100).toFixed(2)}%
              </b></div>
              <div className="row"><span>Projected daily @ {fmt$(capital)}</span><b>
                {fmt$(t.dyMin$)} – {fmt$(t.dyMax$)}
              </b></div>
              <div className="row"><span>Daily risk cap</span><b>{t.riskCap}</b></div>
              <div className="row"><span>DD guardrail</span><b>{t.ddGuard}</b></div>
              <div className="notes">{t.notes}</div>
              {t.recommended && <div className="chip">Recommended</div>}
            </div>
          ))}
        </div>

        {/* Capital control for projections */}
        <div className="projRow">
          <label htmlFor="cap">Projection capital</label>
          <div className="capInputWrap">
            <span>$</span>
            <input
              id="cap"
              type="number"
              min={0}
              step="1000"
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value || 0))}
            />
          </div>
        </div>
      </section>

      {/* ───────────────── Custody + Trades (kept) ───────────────── */}
      <section className="cols">
        <div className="card">
          <h3>Custody & Controls</h3>
          <ul className="list">
            <li>You <strong>keep funds</strong> on your own exchange accounts.</li>
            <li>We use <strong>trade-only API keys</strong> (withdrawals disabled).</li>
            <li>2FA enforced, optional IP allow-listing.</li>
            <li>Daily risk cap: <strong>≤ 1.0%</strong> of allocated capital.</li>
            <li>Auto logs: time-stamped entries, exits, fees, and P&amp;L.</li>
          </ul>
        </div>

        <div className="card">
          <h3>Recent Trades (anonymized)</h3>
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Time (UTC)</th><th>Venue</th><th>Pair</th><th>Side</th>
                  <th>Qty</th><th>Entry</th><th>Exit</th><th>Fees</th><th>P&amp;L</th>
                </tr>
              </thead>
              <tbody>
                {TRADES.map((r, i) => (
                  <tr key={i}>
                    <td>{r.t}</td><td>{r.venue}</td><td>{r.pair}</td><td>{r.side}</td>
                    <td>{r.qty}</td><td>{r.entry}</td><td>{r.exit}</td><td>{r.fees}</td>
                    <td className={r.pnl.startsWith('-') ? 'neg' : 'pos'}>{r.pnl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="note">Full CSV & monthly CPA pack available on request.</p>
        </div>
      </section>

      <footer className="foot">
        <div>Prepared for: <strong>Steve Smith</strong></div>
        <div>Generated: <strong>Aug 22, 2025</strong></div>
      </footer>

      <style jsx>{`
        :global(html, body) { background:#0b0f16; color:#e8eef7; }
        .wrap { max-width:980px; margin:32px auto 80px; padding:0 20px; font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; }
        .header { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; margin-bottom:20px; }
        .title h1 { margin:0 0 6px; font-size:28px; letter-spacing:.2px; }
        .title p { margin:0; opacity:.85; }
        .badgeRow { display:flex; gap:8px; flex-wrap:wrap; }
        .badge { padding:6px 10px; border-radius:999px; font-size:12px; border:1px solid #223043; background:#121926; }
        .badge.green { border-color:#184a2c; background:#0f1f16; color:#9af8c2; }
        .badge.blue  { border-color:#294a76; background:#0f1724; color:#a8c8ff; }
        .badge.gray  { border-color:#334154; background:#111827; color:#c7d2fe; }
        .badge.highlight { border-color:#3a425a; background:#0f1626; color:#e8eef7; }

        .kpis { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:18px 0 24px; }
        .kpi { background:#0f1724; border:1px solid #223043; border-radius:16px; padding:14px 16px; }
        .kLabel { font-size:12px; opacity:.75; margin-bottom:6px; }
        .kValue { font-size:18px; font-weight:700; }

        .card { background:#0e1420; border:1px solid #213247; border-radius:18px; padding:16px; margin-bottom:16px; }
        .cardHead { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
        .card h2 { margin:4px 0; font-size:18px; }
        .legend { font-size:12px; opacity:.85; }

        .chart { width:100%; height:auto; display:block; margin:8px 0; }
        .chartBg { fill:#0b111b; }
        .grid { stroke:#1f2a3a; stroke-width:1; opacity:.35; }
        .eqPath { stroke:#6ee7b7; stroke-width:2.5; }
        .btcPath { stroke:#93c5fd; stroke-width:2; opacity:.95; }

        /* Weekend Highlights */
        .weekends { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
        .wkCard { background:#0f1724; border:1px solid #223043; border-radius:16px; padding:14px; }
        .wkTitle { font-weight:800; margin-bottom:8px; letter-spacing:.2px; }
        .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:8px 16px; margin-bottom:8px; }
        .subhead { margin-top:6px; margin-bottom:4px; font-size:12px; opacity:.85; text-transform:uppercase; letter-spacing:.08em; }
        .row { display:flex; align-items:center; justify-content:space-between; padding:6px 0; border-top:1px solid #1a2334; }
        .row:first-of-type { border-top:none; }
        .why ul { margin:8px 0 0; padding-left:18px; line-height:1.5; }

        /* Risk ladder */
        .ladder { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-top:8px; }
        .tier { position:relative; border:1px solid #223043; background:#0f1724; border-radius:16px; padding:16px; outline:2px solid transparent; }
        .tier.rec { outline-offset:2px; }
        .tierHead { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:8px; }
        .tierName { font-weight:800; letter-spacing:.2px; }
        .tierTag { font-size:12px; opacity:.8; }
        .notes { margin-top:10px; font-size:12px; opacity:.85; }
        .chip { position:absolute; top:10px; right:10px; font-size:11px; padding:4px 8px; border-radius:999px; background:#122033; border:1px solid #244163; }

        /* Projection input */
        .projRow { display:flex; align-items:center; gap:12px; margin-top:12px; }
        .projRow label { font-size:14px; opacity:.9; }
        .capInputWrap { display:flex; align-items:center; gap:6px; background:#0f1724; border:1px solid #223043; border-radius:10px; padding:8px 10px; }
        .capInputWrap span { opacity:.85; }
        .capInputWrap input { width:160px; background:transparent; border:none; outline:none; color:#e8eef7; font-size:14px; }

        .cols { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .list { margin:8px 0 0 0; padding-left:18px; line-height:1.5; }
        .tableWrap { overflow:auto; border-radius:12px; border:1px solid #213247; }
        table { width:100%; border-collapse:collapse; font-size:13px; }
        thead th { text-align:left; background:#0c1624; padding:10px; white-space:nowrap; border-bottom:1px solid #223043; }
        tbody td { padding:10px; border-bottom:1px solid #172034; white-space:nowrap; }
        tbody tr:last-child td { border-bottom:none; }
        .pos { color:#86efac; }
        .neg { color:#fca5a5; }

        .foot { display:flex; justify-content:space-between; margin-top:16px; opacity:.8; font-size:12px; border-top:1px solid #1b2740; padding-top:12px; }

        @media (max-width:980px) {
          .weekends { grid-template-columns:1fr; }
          .ladder { grid-template-columns:1fr; }
          .kpis { grid-template-columns:1fr 1fr; }
          .cols { grid-template-columns:1fr; }
        }
      `}</style>
    </main>
  );
}
